const CACHE_NAME = 'coffee-rating-v17';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 強制立即接管
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // 關鍵修改：只處理來自自己網域的 GET 請求
  // 排除 Firebase Storage 和 Realtime DB 的請求，避免 CORS 衝突與轉型錯誤
  if (
    event.request.method !== 'GET' || 
    !event.request.url.startsWith(self.location.origin)
  ) {
    return; // 直接跳過，不進行 event.respondWith，讓瀏覽器原生機制處理
  }

  event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            // 只有成功的請求且協定符合才快取
            if (response.ok && event.request.url.startsWith('http')) {
                cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // 啟用後立即對當前頁面生效
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
