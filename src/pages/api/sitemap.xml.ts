import { getAllPosts } from '../../lib/notion/client';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const baseUrl = 'https://ai233.top'; // 替换为你的网站URL

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  // post.Slug 为空，给它一个基于文章 id 的默认值，防止产生无效链接
  // 生成安全 slug
  ${posts.map(post => {
    const safeSlug = post.Slug
      ? `${post.Slug}-${post.PageId}`
      : `post-${post.PageId}`;
    return `
    <url>
      <loc>${baseUrl}/posts/${safeSlug}</loc>
      <lastmod>${new Date(post.Date).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
  }).join('')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}; 