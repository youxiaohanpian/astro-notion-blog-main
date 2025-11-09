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

  return rss({
    title: database.Title,
    description: database.Description,
    site: siteBaseURL,
    items: posts.map((post) => ({
      link: new URL(getPostLink(post.Slug), siteBaseURL).toString(),
      title: post.Title,
      description: post.Excerpt,
      pubDate: new Date(post.Date),
    })),
  })
} 