import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
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
  if (env.CUSTOM_DOMAIN) {
    return new URL(env.BASE_PATH, `https://${env.CUSTOM_DOMAIN}`).toString();
  }

  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return new URL(env.BASE_PATH, `https://${process.env.VERCEL_URL}`).toString();
  }

  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== 'main') {
      return new URL(env.BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    return new URL(
      env.BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL).host
        .split('.')
        .slice(1)
        .join('.')}`
    ).toString();
  }

  return new URL(env.BASE_PATH, 'http://localhost:4321').toString();
};

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: env.BASE_PATH,
  output: 'static',
  adapter: vercel(),
  integrations: [
    icon(),
    CoverImageDownloader(),
    CustomIconDownloader(),
    FeaturedImageDownloader(),
    FirstImageDownloader(),
    PublicNotionCopier(),
  ],
  vite: {
    define: {
      'process.env.NOTION_API_SECRET': JSON.stringify(env.NOTION_API_SECRET),
      'process.env.DATABASE_ID': JSON.stringify(env.DATABASE_ID),
    },
  },
});
