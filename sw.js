// Service Worker with update-friendly caching
const CACHE_NAME = 'almashrafiah-v3-2025-09-18';
const ASSETS = [
    '/styles.css',
    '/script.js',
    '/Images/logo.png',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install: pre-cache core assets and activate immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : undefined))
        )).then(() => self.clients.claim())
    );
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Network-first for navigations (HTML)
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put('/', resClone).catch(() => {}));
                    return res;
                })
                .catch(() => caches.match(req).then((r) => r || caches.match('/index.html')))
        );
        return;
    }

    // Stale-while-revalidate for CSS/JS
    if (req.destination === 'style' || req.destination === 'script') {
        event.respondWith(
            caches.match(req).then((cached) => {
                const fetchPromise = fetch(req)
                    .then((res) => {
                        const resClone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
                        return res;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }

    // Cache-first for images and other assets
    if (req.destination === 'image' || ASSETS.some((a) => req.url.includes(a))) {
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req).then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
                return res;
            }))
        );
        return;
    }

    // Default: network
    event.respondWith(fetch(req).catch(() => caches.match(req)));
});