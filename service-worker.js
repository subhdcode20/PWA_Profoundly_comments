const cacheName = 'NG_TSL_API_PWA_1_1_1';
const filesToCache = [
    '/',
    '/index.html',
    '/bundle.js',
    '/logo.png',
    '/notify.png'
];

self.addEventListener('install', function(e) {
    console.info('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            cache.addAll(filesToCache).then(()=>{
                return self.clients.claim();
            });
        })
    );
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(key => {
                if (key.startsWith('NG_TSL') && key !== cacheName) {
                    console.info('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }).catch(e => {
            console.log(e)
        })
    );
});

self.addEventListener('activate', function(e) {
    console.info('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(key => {
                if (key !== cacheName) {
                    console.info('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName).then(function (cache) {
            return caches.match(event.request).then(response => {
                return response || fetch(event.request);
            });
        })
    );
});
