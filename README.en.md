# Astro Notion Blog Enhanced

[中文](README.md) | [English](#astro-notion-blog-enhanced-version) | [日本語](README.ja.md)

## Project Introduction

Astro Notion Blog Enhanced is an optimized version based on the original [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog). While retaining the original functionality, we have made several improvements to the interface and user experience, making it more beautiful, user-friendly, and efficient.

## Quick Start

For detailed build and deployment instructions, please refer to [BUILD.md](BUILD.md).

## Update Log

### 2025-08-04
- Updated Node.js version requirements due to project changes
- Updated start command: You may need to run `npm run dev -- --host` to start the project

### 2025-07-19
1. Changed the website back to static deployment, rolled back middleware, no middleware needed
2. Fixed some CSS compatibility issues
3. Fixed the issue of inserting table of contents in articles
4. Removed like.ts, this feature is not needed currently, like function is simulated
5. Changed sharing function to copy link + title
6. Fixed Chinese search matching issue in searchModal, bound to input [Important]
7. Changed website language to: lang="en-US"
8. Added GitHub recommended SECURITY.md
9. Updated CSP content in version.json, including self, Notion resources, Google Analytics domain, Vercel Insights domain

## Environment Requirements

### Node.js Version
- Recommended: Node.js 20.11.1 LTS
- Minimum: Node.js >= 18.0.0
- npm Version: 10.2.4 or higher

### Main Dependency Versions
```json
{
  "dependencies": {
    "astro": "^5.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@notionhq/client": "^2.2.15"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "typescript": "^5.0.0",
    "dotenv-cli": "^8.0.0"  // For loading environment variables during build
  }
}
```

### Environment Variables Configuration
1. Create a `.env.local` file (do not commit to Git):

```
# Notion API Secret
NOTION_API_SECRET=your_notion_api_secret

# Notion Database ID
DATABASE_ID=your_database_id

# Blog base path (if deployed in a subdirectory)
BASE_PATH=/

# Custom domain (optional)
CUSTOM_DOMAIN=your_custom_domain.com

# Number of posts per page
NUMBER_OF_POSTS_PER_PAGE=10

# Request timeout (milliseconds)
REQUEST_TIMEOUT_MS=30000
```

2. Environment variables loading instructions:
   - Development environment (`npm run dev`): Automatically loads `.env.local`
   - Build environment (`npm run build`): Uses dotenv-cli to load `.env.local`
   - Note: Do not use `.env` file as it might be accidentally committed to Git

### Installation Steps
1. Ensure you're using the correct Node.js version:
   ```bash
   nvm use 18.20.8
   ```

2. Install dependencies:
   ```bash
   npm install
   npm install --save-dev dotenv-cli  # For loading environment variables during build
   ```

3. Configure environment variables:
   - Copy the environment variables template above to `.env.local` file
   - Fill in your Notion API secret and database ID

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build production version:
   ```bash
   npm run build
   ```

6. Preview build results:
   ```bash
   npm run preview
   ```
   - This will start a local server to preview the built website
   - Default address is http://localhost:4321
   - Preview mode simulates production environment, allowing you to check the build results

## Notion Database Configuration

### Required Fields
1. **Page**: Title field for article title
2. **Tags**: Multi-select field for article categories
3. **Date**: Date field for article publication date
4. **Excerpt**: Text field for article summary
5. **FeaturedImage**: File field for article featured image
6. **Published**: Checkbox field to control whether the article is published
7. **Rank**: Number field to control article pinning order
8. **Slug**: Text field for article URL path (recommended to fill in English manually)

### Configuration Steps
1. Create a new database in Notion
2. Add all the required fields above
3. Get the database ID (extracted from the database URL)
4. Add the database ID to the `.env.local` file
5. Share the database with your Notion integration app

## Development and Build Environment Instructions

### Development Environment (`npm run dev`)
- Supports hot reloading
- Automatically loads `.env.local` environment variables
- Suitable for development and debugging

### Build Environment (`npm run build`)
- Generates static files
- Uses dotenv-cli to load `.env.local` environment variables
- Optimizes and compresses resources

### Preview Environment (`npm run preview`)
- Simulates production environment
- Used to test build results
- Checks performance and compatibility

## Deployment Guide

### Vercel Deployment
1. Register or log in to your Vercel account
2. Click the "New Project" button
3. Import your GitHub repository
4. Configure environment variables (same as `.env.local`)
5. Click the "Deploy" button
6. Wait for deployment to complete

### Netlify Deployment
1. Register or log in to your Netlify account
2. Click the "New site from Git" button
3. Select your GitHub repository
4. Configure build command: `npm run build`
5. Configure publish directory: `dist`
6. Configure environment variables (same as `.env.local`)
7. Click the "Deploy site" button
8. Wait for deployment to complete

## Common Issues

### 1. Environment Variables Issue During Build
- Error: `API token is invalid`
- Reason: `.env.local` file not loaded correctly during build
- Solution: Ensure `dotenv-cli` is installed and build script is configured correctly

### 2. Node.js Version Compatibility
- Error: `SyntaxError: missing ) after argument list`
- Reason: Node.js 22.x version incompatible with some dependencies
- Solution: Use Node.js 18.x LTS version

### 3. PowerShell Environment Issue
- Error: `无法将"node.exe"项识别为 cmdlet` (Cannot recognize "node.exe" as a cmdlet)
- Reason: Node.js path issue in PowerShell
- Solution: Use CMD instead of PowerShell to execute commands

### 4. Notion API Access Issue
- Error: `Unauthorized` or `Invalid database ID`
- Reason: Invalid Notion API secret or database not shared with integration app
- Solution: Check if API secret is correct and ensure database is shared with integration app

### 5. Images Not Displaying
- Error: Images fail to load
- Reason: Invalid image links or permission issues
- Solution: Ensure images in Notion are public or use local images

## Main Features and Improvements

### Unified Rounded Corner Design
- All components have unified 4px rounded corners (tables, quotes, callouts, code blocks, images, and bookmarks)
- Added subtle shadow effects to enhance visual hierarchy
- Optimized hover states to enhance interaction experience

### Blog Card Optimization
- Removed "Read more" button, entire card is clickable
- Optimized tag layout and style
- Improved responsive design for better mobile experience
- Enhanced image display logic, supporting three image sources:
  1. FeaturedImage (highest priority): Images from Notion fields, optimized
  2. Cover (second priority): Images from online galleries, suitable for high-quality covers
  3. FirstImage (third priority): First image in article, suitable for temporary use
- Image loading optimization:
  - Lazy loading to improve performance
  - Asynchronous decoding to reduce blocking
  - Fixed aspect ratio to avoid layout shifts
  - Supports different handling methods for development and production environments
- Image display rules:
  - If none of the three image sources are uploaded, only article title and content will be displayed
  - Cover field can be deleted, system will automatically downgrade to FirstImage
  - It is recommended to upload at least one image to enhance article display

### Article Navigation Improvement
- Optimized navigation layout: Previous article on left, next article on right
- Added beautiful hover effects (slight floating and shadow enhancement)
- Optimized text alignment (previous article left-aligned, next article right-aligned)
- Ensured good display effect on all devices

### Article Detail Page Optimization
- Adjusted time display position below title to be consistent with homepage
- Unified tag style and interaction effects
- Optimized mobile menu button, remains fixed during scrolling

### Notion Block Style Optimization
- Added rounded corners to Callout blocks to enhance visual appeal
- Added right rounded corners and subtle background color to Quote blocks
- Enhanced copy button hover effects and custom scrollbars for Code blocks
- Added rounded corners and shadow effects to Image blocks to improve overall texture

### Type Safety Enhancement
- Added type checks for all components to ensure Notion blocks exist
- Added type guard functions to improve code robustness
- Fixed multiple type errors to comply with TypeScript best practices

### Localization Optimization
- Simplified Chinese interface text to improve Chinese user experience
- Optimized font configuration to perfectly support Chinese display

### Breadcrumb Navigation
- Added breadcrumb navigation next to search button to clearly indicate current position
- Provided simple API allowing each page to define its own breadcrumb path
- Automatically hides homepage text on small screens, only shows icon to save space
- Design style consistent with overall UI, including hover effects and rounded design

### Slug Required Option
- Attempts to automatically build Slug, but Chinese support is not very good
- Need to manually fill in English in Notion
- If Slug is empty, system will use Notion page ID as fallback to ensure link validity

### Article Pinning Sorting Rules
- Supports Notion database's Rank field to implement article pinning sorting
- Fill Rank with numbers greater than 0, larger numbers come first (more pinned)
- Articles without Rank or Rank=0 are ranked after all articles with Rank, sorted by publication time in reverse order
- Example: Rank=3 > Rank=2 > Rank=1 > no Rank/Rank=0
- If only one article has Rank=1 and others don't, that article is pinned; if there are Rank=2 and Rank=1, 2 is pinned first, 1 second, others in reverse chronological order

## Extension and Customization Guide

### How to Modify or Extend Translation Services

Edit the `src/lib/slug-helpers.ts` file:

1. **Create a new translation service class**:
```typescript
class YourTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    // Implement your translation logic
    return translatedText;
  }
}
```

2. **Add the new service in TranslationServiceFactory**:
```typescript
static getService(type: 'google' | 'pinyin' | 'your-service' = 'google'): TranslationService {
  switch (type) {
    case 'your-service':
      return new YourTranslationService();
    // ... other services
  }
}
```

3. **Update service priority in translateWithFallback function**:
```typescript
const serviceTypes: Array<'google' | 'pinyin' | 'your-service'> = ['google', 'your-service', 'pinyin'];
```

### About Pinyin Conversion Service

The current pinyin conversion service only includes a small number of commonly used Chinese characters. The Chinese General Standard Characters Table includes 8105 characters, of which 3500 are commonly used (Level 1 characters).

**Recommended to use professional pinyin library**:

1. Install professional pinyin library:
```bash
npm install pinyin
```

2. Modify `PinyinTranslationService` class:
```typescript
import pinyin from 'pinyin';

class PinyinTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join('');
    
    return result;
  }
}
```

This will provide full support for all Chinese characters, not just a small number of example characters.

## Breadcrumb Navigation Usage Guide

In any page component, you can add breadcrumb navigation by passing the breadcrumbs property to the Layout component:

```astro
<Layout 
  title="Article Categories" 
  description="View all log categories" 
  path="/categories" 
  ogImage="" 
  breadcrumbs={[
    { label: 'Categories', href: '/categories' }
  ]}
>
  <!-- Page content -->
</Layout>
```

For deeper pages, you can add multiple breadcrumb items:

```astro
<Layout 
  title="Technical Articles" 
  description="All articles about technology" 
  path="/categories/tech" 
  ogImage="" 
  breadcrumbs={[
    { label: 'Categories', href: '/categories' },
    { label: 'Technology', href: '/categories/tech' }
  ]}
>
  <!-- Page content -->
</Layout>
```

The breadcrumb navigation will automatically add a homepage link, no need to add it manually. On small screens, the homepage text will be automatically hidden, only showing the icon to save space.

## Project Structure

```
astro-notion-blog/
├── .cursor/               # Cursor IDE configuration
├── .github/               # GitHub configuration
├── .vscode/               # VS Code configuration
├── cline_docs/            # Project documentation
├── public/                # Static resources
├── scripts/               # Script files
├── src/                   # Source code
│   ├── components/        # Components
│   ├── content/           # Content
│   ├── images/            # Image resources
│   ├── integrations/      # Astro integrations
│   ├── layouts/           # Layouts
│   ├── lib/               # Utility functions
│   ├── pages/             # Pages
│   └── styles/            # Styles
├── astro.config.mjs       # Astro configuration
├── package.json           # Dependency configuration
├── README.md              # Project description
└── ...                    # Other configuration files
```

## Contribution Guide

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgements

Special thanks to the original author [otoyo](https://github.com/otoyo) for providing the excellent project framework and ideas. The original project provides us with an excellent solution for using Notion as a CMS, allowing us to focus on content creation without worrying about backend management.

This enhanced version optimizes the interface and user experience on the original basis, hoping to provide a better blogging experience for more Chinese users.

## License

Consistent with the original project, this project adopts the [MIT License](LICENSE).