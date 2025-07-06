// 作用是让浏览器“听说”你写了个 SW，来帮你管理缓存和网络请求，提升访问速度和离线体验。
// 没有它，Service Worker 不会生效，缓存和离线能力也就没法实现。
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker registered');
      }).catch(err => {
        console.error('Service Worker registration failed:', err);
      });
    });
  }