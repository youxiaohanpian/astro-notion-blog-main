const CACHE_NAME = 'dynamic-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 这里可以缓存首页、静态资源等
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  if (url.includes('/api/blocks/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        }).catch(() => {
          // 网络失败时 fallback 缓存
          return cached;
        });

        // 优先返回缓存，缓存没命中就返回网络请求结果
        return cached || fetchPromise;
      })
    );
  }
  // 其他请求不拦截
});