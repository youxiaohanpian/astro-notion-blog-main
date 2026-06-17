/**
 * Notion to Markdown Export Script
 * 
 * Exports all published Notion pages to Markdown files with images downloaded locally.
 * Images are saved to an assets/ folder for GitHub-compatible structure.
 * 
 * Usage: node scripts/notion-to-markdown.cjs
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('@notionhq/client');
const { NotionConverter } = require('notion-to-md');
const { DefaultExporter } = require('notion-to-md/plugins/exporter');
const path = require('path');
const fs = require('fs');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_SECRET });
const DATABASE_ID = process.env.DATABASE_ID;

// Output directory - Desktop/markdown
const OUTPUT_DIR = path.join(process.env.HOME, 'Desktop', 'markdown');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');

/**
 * Get all published pages from Notion database
 */
async function getPublishedPages() {
  console.log('📋 Fetching published pages from Notion...');
  
  const params = {
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  };

  let results = [];
  while (true) {
    const res = await notion.databases.query(params);
    results = results.concat(res.results);
    
    if (!res.has_more) {
      break;
    }
    params.start_cursor = res.next_cursor;
  }

  console.log(`✅ Found ${results.length} published pages`);
  return results;
}

/**
 * Extract page metadata for frontmatter
 */
function extractMetadata(page) {
  const properties = page.properties;
  
  // Get title
  let title = '';
  if (properties.Page?.title) {
    title = properties.Page.title[0]?.plain_text || '';
  } else if (properties.Name?.title) {
    title = properties.Name.title[0]?.plain_text || '';
  }
  
  // Get slug
  let slug = '';
  if (properties.Slug?.rich_text) {
    slug = properties.Slug.rich_text[0]?.plain_text || '';
  }
  
  // Get date
  let date = '';
  if (properties.Date?.date) {
    date = properties.Date.date.start || '';
  }
  
  // Get tags
  let tags = [];
  if (properties.Tags?.multi_select) {
    tags = properties.Tags.multi_select.map(t => t.name);
  }
  
  // Get excerpt
  let excerpt = '';
  if (properties.Excerpt?.rich_text) {
    excerpt = properties.Excerpt.rich_text[0]?.plain_text || '';
  }
  
  // Get featured image
  let featuredImage = '';
  if (properties.FeaturedImage?.files) {
    const file = properties.FeaturedImage.files[0];
    if (file?.type === 'external') {
      featuredImage = file.external.url;
    } else if (file?.type === 'file') {
      featuredImage = file.file.url;
    }
  }
  
  return { title, slug, date, tags, excerpt, featuredImage };
}

/**
 * Sanitize filename for filesystem
 */
function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Convert a single page to Markdown
 */
async function convertPage(pageId, metadata, index, total) {
  const { title, slug, date, tags, excerpt, featuredImage } = metadata;
  
  // Create filename
  const filename = slug || sanitizeFilename(title) || pageId;
  const mdFilename = `${filename}.md`;
  const mdPath = path.join(OUTPUT_DIR, mdFilename);
  
  console.log(`[${index + 1}/${total}] Converting: ${title || pageId}`);
  
  // Create exporter for this page
  const exporter = new DefaultExporter({
    outputType: 'file',
    outputPath: mdPath,
  });
  
  // Create converter with media download
  const converter = new NotionConverter(notion)
    .withExporter(exporter)
    .downloadMediaTo({
      outputDir: ASSETS_DIR,
      transformPath: (localPath) => {
        // Return relative path from markdown file to assets
        const relativePath = path.relative(OUTPUT_DIR, localPath);
        return relativePath.replace(/\\/g, '/'); // Normalize for Windows
      },
      preserveExternalUrls: false,
    });
  
  try {
    // Convert the page
    await converter.convert(pageId);
    
    // Read the generated markdown and add frontmatter
    if (fs.existsSync(mdPath)) {
      let content = fs.readFileSync(mdPath, 'utf-8');
      
      // Build frontmatter
      const frontmatter = [
        '---',
        `title: "${title.replace(/"/g, '\\"')}"`,
        `date: ${date}`,
        `slug: ${filename}`,
        excerpt ? `excerpt: "${excerpt.replace(/"/g, '\\"')}"` : null,
        tags.length > 0 ? `tags: [${tags.map(t => `"${t}"`).join(', ')}]` : null,
        featuredImage ? `featured_image: assets/${path.basename(featuredImage)}` : null,
        `notion_id: ${pageId}`,
        '---',
        '',
      ].filter(Boolean).join('\n');
      
      // Prepend frontmatter
      content = frontmatter + content;
      
      fs.writeFileSync(mdPath, content, 'utf-8');
      console.log(`  ✅ Saved: ${mdFilename}`);
      return true;
    }
  } catch (error) {
    console.error(`  ❌ Error converting ${title || pageId}:`, error.message);
    return false;
  }
}

/**
 * Main export function
 */
async function main() {
  console.log('🚀 Starting Notion to Markdown export...\n');
  
  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
  
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🖼️  Assets directory: ${ASSETS_DIR}\n`);
  
  // Get all published pages
  const pages = await getPublishedPages();
  
  if (pages.length === 0) {
    console.log('⚠️  No published pages found');
    return;
  }
  
  // Convert each page
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const metadata = extractMetadata(page);
    
    const success = await convertPage(page.id, metadata, i, pages.length);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Export Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully exported: ${successCount} pages`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} pages`);
  }
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🖼️  Assets directory: ${ASSETS_DIR}`);
  console.log('='.repeat(50));
}

// Run the export
main().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
