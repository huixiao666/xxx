// 缓存名称（版本号）
const CACHE_NAME = 'icon-cache-v1';

// 判断是否为图片请求
const isImageRequest = (request) => {
    const url = new URL(request.url);
    return /\.(jpe?g|png|gif|svg|webp|bmp|ico)$/i.test(url.pathname);
};

self.addEventListener('install', (event) => {
    self.skipWaiting(); // 立即激活
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET' || !isImageRequest(request)) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});