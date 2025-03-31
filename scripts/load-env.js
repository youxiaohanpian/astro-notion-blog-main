import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local 文件
config({ path: join(__dirname, '../.env.local') });

// 导出环境变量
export const env = {
  NOTION_API_SECRET: process.env.NOTION_API_SECRET,
  DATABASE_ID: process.env.DATABASE_ID,
  CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN,
  BASE_PATH: process.env.BASE_PATH || '',
  PUBLIC_GA_TRACKING_ID: process.env.PUBLIC_GA_TRACKING_ID,
  ENABLE_LIGHTBOX: process.env.ENABLE_LIGHTBOX,
}; 