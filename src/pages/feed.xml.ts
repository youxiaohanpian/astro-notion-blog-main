import rss from '@astrojs/rss'
import { getAllPosts, getDatabase } from '../lib/notion/client'
import { getPostLink } from '../lib/blog-helpers'

export async function GET() {
  const [posts, database] = await Promise.all([getAllPosts(), getDatabase()])

  // 获取有效的站点URL
  const getValidSite = (): string => {
    const site = import.meta.env.SITE;
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

  return rss({
    title: database.Title,
    description: database.Description,
    site: siteBaseURL,
    items: validPosts.map((post) => {
      const postLink = getPostLink(post.Slug);
      // 确保 postLink 不为空
      if (!postLink || postLink.trim() === '') {
        console.warn(`文章[${post.Title}]的链接无效，跳过:`, post.Slug);
        return null;
      }
      try {
        return {
          link: new URL(postLink, siteBaseURL).toString(),
          title: post.Title,
          description: post.Excerpt,
          pubDate: new Date(post.Date),
        };
      } catch (error) {
        console.error(`生成文章[${post.Title}]链接失败:`, error);
        return null;
      }
    }).filter((item) => item !== null),
  })
} 