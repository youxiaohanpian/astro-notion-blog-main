import type { APIRoute } from 'astro';
import { getAllPosts } from '../lib/notion/client';
import { getPostLink } from '../lib/blog-helpers';
import { getDatabase } from '../lib/notion/client';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts();
  const database = await getDatabase();
  
  // 获取有效的站点URL
  const getValidSite = (): string => {
    if (site && typeof site === 'string' && site.trim() !== '') {
      try {
        new URL(site);
        return site;
      } catch {
        // URL 无效，使用默认值
      }
    }
    // 使用默认值，优先从环境变量获取
    return process.env.CUSTOM_DOMAIN 
      ? `https://${process.env.CUSTOM_DOMAIN}`
      : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://localhost:4321';
  };
  
  const siteBaseURL = getValidSite();
  
  // 过滤掉无效的 post（没有 Slug 的）
  const validPosts = posts.filter((post) => {
    return post.Slug && post.Slug.trim() !== '';
  });
  
  // 生成 RSS items，过滤掉无效的链接
  const rssItems = validPosts.map((post) => {
    try {
      const postLink = getPostLink(post.Slug);
      if (!postLink || postLink.trim() === '') {
        console.warn(`文章[${post.Title}]的链接无效，跳过:`, post.Slug);
        return '';
      }
      const postURL = new URL(postLink, siteBaseURL).href;
      return `
    <item>
      <title><![CDATA[${post.Title || ''}]]></title>
      <description><![CDATA[${post.Excerpt || ''}]]></description>
      <link>${postURL}</link>
      <guid>${postURL}</guid>
      <pubDate>${new Date(post.Date).toUTCString()}</pubDate>
      <category>${post.Tags.map(tag => tag.name).join(', ')}</category>
    </item>`;
    } catch (error) {
      console.error(`生成文章[${post.Title}]链接失败:`, error);
      return '';
    }
  }).filter(item => item !== '').join('');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${database.Title}</title>
    <description>${database.Description}</description>
    <link>${new URL('/', siteBaseURL).href}</link>
    <atom:link href="${new URL('/rss.xml', siteBaseURL).href}" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}; 