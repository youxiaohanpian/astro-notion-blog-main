import type { APIRoute } from 'astro';
import { getAllPosts } from '../lib/notion/client';
import { getPostLink } from '../lib/blog-helpers';
import { getDatabase } from '../lib/notion/client';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts();
  const database = await getDatabase();
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${database.Title}</title>
    <description>${database.Description}</description>
    <link>${new URL('/', site).href}</link>
    <atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map((post) => `
    <item>
      <title><![CDATA[${post.Title}]]></title>
      <description><![CDATA[${post.Excerpt || ''}]]></description>
      <link>${new URL(getPostLink(post.Slug), site).href}</link>
      <guid>${new URL(getPostLink(post.Slug), site).href}</guid>
      <pubDate>${new Date(post.Date).toUTCString()}</pubDate>
      <category>${post.Tags.map(tag => tag.name).join(', ')}</category>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}; 