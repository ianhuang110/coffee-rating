const CACHE_NAME = 'coffee-rating-v6';
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
  // 改為 Network-First (網路優先) 策略，確保每次都抓最新檔案，失敗時才讀取快取
  event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            // 只有 GET 請求且為 http/https 協定才快取，避免擋住 Firebase 的資料庫連線
            if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
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
