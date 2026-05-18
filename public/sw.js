const CACHE_NAME = 'smart-shopping-list-pwa-v9';

const appShellUrl = () => new URL('index.html', self.registration.scope).href;
const scopeUrl = () => new URL('.', self.registration.scope).href;

const staticAssetUrls = () => [
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
  new URL('screenshot-wide.png', self.registration.scope).href,
  new URL('screenshot-mobile.png', self.registration.scope).href,
];

const buildAssetUrlsFromHtml = (html) => {
  const assetPaths = [...html.matchAll(/(?:href|src)="([^"]*\.(?:js|css))"/g)].map((match) => match[1]);
  return [...new Set(assetPaths)].map((path) => new URL(path, self.registration.scope).href);
};

const buildAssetUrls = async (html) => buildAssetUrlsFromHtml(html);

const cacheUrlIfAvailable = async (cache, url) => {
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // Optional assets should not prevent the cached app shell from working offline.
  }
};

const cacheRequiredUrl = async (cache, url) => {
  const response = await fetch(url, { cache: 'reload' });
  if (!response.ok) {
    throw new Error(`Unable to cache required asset ${url}: ${response.status}`);
  }

  await cache.put(url, response);
};

const cacheOptionalUrls = async (cache, urls) => {
  await Promise.all([...new Set(urls)].map((url) => cacheUrlIfAvailable(cache, url)));
};

const cacheRequiredUrls = async (cache, urls) => {
  await Promise.all([...new Set(urls)].map((url) => cacheRequiredUrl(cache, url)));
};

const cacheAppShell = async (cache) => {
  const response = await fetch(appShellUrl(), { cache: 'reload' });
  if (!response.ok) {
    throw new Error(`Unable to cache app shell: ${response.status}`);
  }

  const html = await response.clone().text();
  await Promise.all([
    cache.put(appShellUrl(), response.clone()),
    cache.put(scopeUrl(), response.clone()),
  ]);
  return html;
};

const cacheAssets = async () => {
  const cache = await caches.open(CACHE_NAME);
  const html = await cacheAppShell(cache);
  await cacheRequiredUrls(cache, await buildAssetUrls(html));
  await cacheOptionalUrls(cache, staticAssetUrls());
};

const missingCachedUrls = async (cache, urls) => {
  const cachedUrls = new Set((await cache.keys()).map((request) => request.url));
  return urls.filter((url) => !cachedUrls.has(url));
};

const isCacheableAppShellResponse = (response) => {
  if (response.ok) return true;

  const contentType = response.headers.get('content-type') ?? '';
  return response.status === 404 && contentType.includes('text/html');
};

const refreshCachedAppShell = async (response, request) => {
  if (!isCacheableAppShellResponse(response)) { return; }

  const cache = await caches.open(CACHE_NAME);
  const html = await response.clone().text();
  await Promise.all([
    cache.put(request, response.clone()),
    cache.put(new URL('index.html', self.registration.scope).href, response.clone()),
    cache.put(scopeUrl(), response.clone()),
  ]);

  const missingAssetUrls = await missingCachedUrls(cache, buildAssetUrlsFromHtml(html));
  if (missingAssetUrls.length > 0) {
    await cacheRequiredUrls(cache, missingAssetUrls);
  }
};

const cachedAppShellResponse = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(request)) ??
    (await cache.match(appShellUrl())) ??
    (await cache.match(scopeUrl()));
};

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() =>
      self.clients.claim(),
    ),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          refreshCachedAppShell(response, event.request).catch(() => {
            // Non-fatal: the network response still serves the latest app shell.
          });
          return response;
        })
        .catch(async () => {
          return (await cachedAppShellResponse(event.request)) ?? Response.error();
        }),
    );
    return;
  }

  if (event.request.cache === 'reload') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(event.request) ?? new Response('', { status: 504, statusText: 'Offline' });
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(event.request) ?? new Response('', { status: 504, statusText: 'Offline' });
        });
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? self.registration.scope;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const matchingClient = clients.find((client) => client.url === targetUrl || client.url.startsWith(targetUrl));
      if (matchingClient) {
        return matchingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});
