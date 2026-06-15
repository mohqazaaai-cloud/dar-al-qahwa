const CACHE_NAME = 'dar-al-qahwa-v1';
const STATIC_CACHE = 'daq-static-v1';
const API_CACHE = 'daq-api-v1';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/menu',
  '/reserve',
  '/gallery',
  '/events',
  '/loyalty',
  '/contact',
  '/css/main.css',
  '/js/api.js',
  '/js/lang.js',
  '/js/animations.js',
  '/js/cart.js',
  '/js/router.js',
  '/js/app.js',
  '/js/pages/home.js',
  '/js/pages/menu.js',
  '/js/pages/reserve.js',
  '/js/pages/order-confirm.js',
  '/js/pages/login.js',
  '/js/pages/gallery.js',
  '/js/pages/loyalty.js',
  '/js/pages/events.js',
  '/js/pages/contact.js',
  '/js/pages/qr.js',
  '/js/pages/admin.js',
  '/manifest.json',
];

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/menu',
  '/api/events',
  '/api/gallery',
  '/api/settings/public',
];

// ── INSTALL ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('SW precache error:', err))
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, etc.
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API requests: network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    if (API_ROUTES.some(r => url.pathname.startsWith(r))) {
      event.respondWith(networkFirstWithCache(request, API_CACHE, 10000));
    }
    return;
  }

  // Google Fonts: cache first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Unsplash images: cache first (long TTL)
  if (url.hostname === 'images.unsplash.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // QR API
  if (url.hostname === 'api.qrserver.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Static assets: cache first
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages: network first, fall back to cached index
  event.respondWith(
    fetch(request)
      .then(response => {
        const clone = response.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('/')))
  );
});

// ── STRATEGIES ──
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timeout);
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'You are offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'Dar Al-Qahwa';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

async function syncPendingOrders() {
  // In a real app, this would sync any orders placed while offline
  console.log('SW: Background sync triggered');
}

// Handle skip waiting message from app
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
