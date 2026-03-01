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
  HOME_NAV_DATABASE_ID: process.env.HOME_NAV_DATABASE_ID,
  FRIEND_LINK_DATABASE_ID: process.env.FRIEND_LINK_DATABASE_ID,
  ENABLE_GISCUS: process.env.ENABLE_GISCUS,
  GISCUS_REPO: process.env.GISCUS_REPO,
  GISCUS_REPO_ID: process.env.GISCUS_REPO_ID,
  GISCUS_CATEGORY: process.env.GISCUS_CATEGORY,
  GISCUS_CATEGORY_ID: process.env.GISCUS_CATEGORY_ID,
  GISCUS_MAPPING: process.env.GISCUS_MAPPING,
  GISCUS_STRICT: process.env.GISCUS_STRICT,
  GISCUS_REACTIONS_ENABLED: process.env.GISCUS_REACTIONS_ENABLED,
  GISCUS_EMIT_METADATA: process.env.GISCUS_EMIT_METADATA,
  GISCUS_INPUT_POSITION: process.env.GISCUS_INPUT_POSITION,
  GISCUS_THEME: process.env.GISCUS_THEME,
  GISCUS_LANG: process.env.GISCUS_LANG,
  CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN,
  BASE_PATH: process.env.BASE_PATH || '',
  PUBLIC_GA_TRACKING_ID: process.env.PUBLIC_GA_TRACKING_ID,
  ENABLE_LIGHTBOX: process.env.ENABLE_LIGHTBOX,
};
