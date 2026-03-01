import { env } from '../scripts/load-env.js';

export const NOTION_API_SECRET = env.NOTION_API_SECRET;
export const DATABASE_ID = env.DATABASE_ID;
export const HOME_NAV_DATABASE_ID = env.HOME_NAV_DATABASE_ID;
export const FRIEND_LINK_DATABASE_ID = env.FRIEND_LINK_DATABASE_ID;
export const ENABLE_GISCUS = env.ENABLE_GISCUS === 'true';
export const GISCUS_REPO = env.GISCUS_REPO;
export const GISCUS_REPO_ID = env.GISCUS_REPO_ID;
export const GISCUS_CATEGORY = env.GISCUS_CATEGORY;
export const GISCUS_CATEGORY_ID = env.GISCUS_CATEGORY_ID;
export const GISCUS_MAPPING = env.GISCUS_MAPPING || 'pathname';
export const GISCUS_STRICT = env.GISCUS_STRICT || '0';
export const GISCUS_REACTIONS_ENABLED = env.GISCUS_REACTIONS_ENABLED || '1';
export const GISCUS_EMIT_METADATA = env.GISCUS_EMIT_METADATA || '0';
export const GISCUS_INPUT_POSITION = env.GISCUS_INPUT_POSITION || 'top';
export const GISCUS_THEME = env.GISCUS_THEME || 'preferred_color_scheme';
export const GISCUS_LANG = env.GISCUS_LANG || 'zh-CN';
export const CUSTOM_DOMAIN = env.CUSTOM_DOMAIN;
export const BASE_PATH = env.BASE_PATH;
export const PUBLIC_GA_TRACKING_ID = env.PUBLIC_GA_TRACKING_ID;
export const NUMBER_OF_POSTS_PER_PAGE = 12;
export const REQUEST_TIMEOUT_MS = parseInt(
  process.env.REQUEST_TIMEOUT_MS || '30000',
  10
);
export const ENABLE_LIGHTBOX = env.ENABLE_LIGHTBOX;
