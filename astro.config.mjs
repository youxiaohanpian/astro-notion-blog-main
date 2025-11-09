import { defineConfig } from 'astro/config';
// import vercel from '@astrojs/vercel/static'; // 移除 Vercel 适配器
import icon from 'astro-icon';
import { env } from './scripts/load-env.js';
import CoverImageDownloader from './src/integrations/cover-image-downloader';
import CustomIconDownloader from './src/integrations/custom-icon-downloader';
import FeaturedImageDownloader from './src/integrations/featured-image-downloader';
import FirstImageDownloader from './src/integrations/first-image-downloader';
import PublicNotionCopier from './src/integrations/public-notion-copier';
// 加载环境变量
import dotenv from 'dotenv';
dotenv.config();

const getSite = function () {
  try {
    // 优先使用自定义域名
    if (env.CUSTOM_DOMAIN && env.CUSTOM_DOMAIN.trim() !== '') {
      const customDomain = env.CUSTOM_DOMAIN.trim();
      // 确保域名格式正确（移除可能的协议前缀）
      const cleanDomain = customDomain.replace(/^https?:\/\//, '');
      return new URL(env.BASE_PATH || '/', `https://${cleanDomain}`).toString();
    }

    // Vercel 环境
    if (process.env.VERCEL && process.env.VERCEL_URL) {
      const vercelUrl = process.env.VERCEL_URL.trim();
      // 确保 URL 格式正确
      const cleanVercelUrl = vercelUrl.replace(/^https?:\/\//, '');
      return new URL(env.BASE_PATH || '/', `https://${cleanVercelUrl}`).toString();
    }

    // Cloudflare Pages 环境
    if (process.env.CF_PAGES) {
      if (process.env.CF_PAGES_BRANCH !== 'main' && process.env.CF_PAGES_URL) {
        const cfUrl = process.env.CF_PAGES_URL.trim();
        return new URL(env.BASE_PATH || '/', cfUrl).toString();
      }

      if (process.env.CF_PAGES_URL) {
        try {
          const cfUrl = new URL(process.env.CF_PAGES_URL);
          const host = cfUrl.host.split('.').slice(1).join('.');
          return new URL(env.BASE_PATH || '/', `https://${host}`).toString();
        } catch (error) {
          console.warn('Invalid CF_PAGES_URL:', process.env.CF_PAGES_URL);
        }
      }
    }

    // 默认本地开发环境
    return new URL(env.BASE_PATH || '/', 'http://localhost:4321').toString();
  } catch (error) {
    console.error('Error in getSite():', error);
    // 如果所有情况都失败，返回一个安全的默认值
    return 'http://localhost:4321';
  }
};

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: env.BASE_PATH,
  output: 'static', // 改为静态输出
  //output: 'server', // 关键！有中间件必须是 server
  //adapter: node({ mode: 'standalone' }),  // 推荐用 standalone，适合大多数场景,中间件必须用SSR适配器
  // adapter: vercel(), // 移除适配器 // ❌ 移除
  integrations: [
    icon(),
    CoverImageDownloader(),
    CustomIconDownloader(),
    FeaturedImageDownloader(),
    FirstImageDownloader(),
    PublicNotionCopier(),
  ],
  experimental: {
    session: false, //新版 Astro 对 session 功能是实验性质，必须手动开启
  },
  vite: {
    define: {
      'process.env.NOTION_API_SECRET': JSON.stringify(env.NOTION_API_SECRET),
      'process.env.DATABASE_ID': JSON.stringify(env.DATABASE_ID),
    },
  },
});
