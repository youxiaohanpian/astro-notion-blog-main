import { env } from '../scripts/load-env.js';

export const NOTION_API_SECRET = env.NOTION_API_SECRET;
export const DATABASE_ID = env.DATABASE_ID;
export const CUSTOM_DOMAIN = env.CUSTOM_DOMAIN;
export const BASE_PATH = env.BASE_PATH;
export const PUBLIC_GA_TRACKING_ID = env.PUBLIC_GA_TRACKING_ID;
export const NUMBER_OF_POSTS_PER_PAGE = 12;
export const REQUEST_TIMEOUT_MS = parseInt(
  process.env.REQUEST_TIMEOUT_MS || '30000',
  10
);
export const ENABLE_LIGHTBOX = env.ENABLE_LIGHTBOX;
