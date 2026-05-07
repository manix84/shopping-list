export const registerServiceWorker = (): void => {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) { return; }

  let hasReloadedForUpdate = false;
  let updateTimeoutId: number | undefined;

  const assetReferencePattern = /(?:href|src)="([^"]*\.(?:js|css))"/g;

  const appBaseUrl = (): URL => new URL(import.meta.env.BASE_URL, window.location.origin);

  const currentAssetUrls = (): Set<string> => new Set(
    Array.from(document.querySelectorAll<HTMLLinkElement | HTMLScriptElement>('script[src], link[rel="stylesheet"][href]'))
      .map((element) => {
        if (element instanceof HTMLScriptElement) { return element.src; }
        return element.href;
      })
      .filter((url) => /\.(?:js|css)(?:[?#]|$)/.test(url)),
  );

  const latestAssetUrlsFromHtml = (html: string): string[] => [...html.matchAll(assetReferencePattern)]
    .map((match) => new URL(match[1], appBaseUrl()).href);

  const reloadForUpdate = (): void => {
    if (hasReloadedForUpdate) { return; }

    hasReloadedForUpdate = true;
    window.location.reload();
  };

  const reloadIfAppShellChanged = async (): Promise<void> => {
    const response = await fetch(new URL('index.html', appBaseUrl()).href, { cache: 'reload' });
    if (!response.ok) { return; }

    const currentAssets = currentAssetUrls();
    const latestAssets = latestAssetUrlsFromHtml(await response.text());
    if (latestAssets.some((url) => !currentAssets.has(url))) {
      reloadForUpdate();
    }
  };

  const requestUpdate = (registration: ServiceWorkerRegistration): void => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) { return; }

    window.clearTimeout(updateTimeoutId);
    updateTimeoutId = window.setTimeout(() => {
      registration.update().catch(() => {
        // Non-fatal: cached assets continue to serve the current app revision.
      });
      reloadIfAppShellChanged().catch(() => {
        // Non-fatal: the active page can keep running until the next navigation.
      });
    }, 250);
  };

  const activateWaitingWorker = (registration: ServiceWorkerRegistration): void => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  };

  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    const hadActiveController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' }).then((registration) => {
      activateWaitingWorker(registration);
      requestUpdate(registration);

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) { return; }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            activateWaitingWorker(registration);
          }
        });
      });

      window.addEventListener('online', () => requestUpdate(registration));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          requestUpdate(registration);
        }
      });
    }).catch(() => {
      // Non-fatal: the app still works without an installable service worker.
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadActiveController || hasReloadedForUpdate) { return; }

      reloadForUpdate();
    });
  });
};
