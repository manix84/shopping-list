export const registerServiceWorker = (): void => {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) { return; }

  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Non-fatal: the app still works without an installable service worker.
    });
  });
};
