const CACHE_NAME = 'smart-shopping-list-pwa-v5';

const assetUrls = () => [
  new URL('index.html', self.registration.scope).href,
  new URL('manifest.webmanifest', self.registration.scope).href,
  new URL('favicon-light.png', self.registration.scope).href,
  new URL('favicon-dark.png', self.registration.scope).href,
  new URL('favicon-16.png', self.registration.scope).href,
  new URL('favicon-32.png', self.registration.scope).href,
  new URL('logo-mark.png', self.registration.scope).href,
  new URL('logo-animated-loop.svg', self.registration.scope).href,
  new URL('logo-animated-once.svg', self.registration.scope).href,
  new URL('logo-light.png', self.registration.scope).href,
  new URL('logo-dark.png', self.registration.scope).href,
  new URL('logo-universal.png', self.registration.scope).href,
  new URL('qr-logo-light.png', self.registration.scope).href,
  new URL('qr-logo-dark.png', self.registration.scope).href,
  new URL('icon-192.png', self.registration.scope).href,
  new URL('icon-512.png', self.registration.scope).href,
  new URL('icon-192-maskable.png', self.registration.scope).href,
  new URL('icon-512-maskable.png', self.registration.scope).href,
  new URL('apple-touch-icon.png', self.registration.scope).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetUrls())).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() =>
      self.clients.claim(),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(new URL('index.html', self.registration.scope).href)) ?? cache.match(new URL('.', self.registration.scope).href);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    }),
  );
});
