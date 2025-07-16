// src/integrations/security-headers.ts（建议单独创建集成文件）
import type { AstroIntegration } from 'astro';

export default {
  name: 'security-headers',
  hooks: {
    'astro:server:setup': ({ server }) => {
      // 开发服务器中间件，仅在 npm run dev 时生效
      server.middlewares.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff'); // 关键头
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
      });
    },
  },
} satisfies AstroIntegration;