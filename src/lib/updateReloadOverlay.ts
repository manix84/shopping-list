import { createMessages, loadLocale } from './i18n';

export const UPDATE_RELOAD_FADE_MS = 220;

const UPDATE_RELOAD_OVERLAY_ID = 'pwa-update-reload-overlay';
const UPDATE_RELOAD_OVERLAY_STYLE_ID = 'pwa-update-reload-overlay-style';
const UPDATE_RELOAD_SESSION_KEY = 'shoppingList:updateReloadOverlay';

const readUpdateReloadSessionFlag = (): boolean => {
  try {
    return window.sessionStorage.getItem(UPDATE_RELOAD_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const writeUpdateReloadSessionFlag = (): void => {
  try {
    window.sessionStorage.setItem(UPDATE_RELOAD_SESSION_KEY, 'true');
  } catch {
    // Non-fatal: the overlay still appears before reload, but cannot persist across it.
  }
};

const clearUpdateReloadSessionFlag = (): void => {
  try {
    window.sessionStorage.removeItem(UPDATE_RELOAD_SESSION_KEY);
  } catch {
    // Non-fatal: storage may be unavailable in private or locked-down browser modes.
  }
};

const ensureUpdateReloadOverlayStyles = (): void => {
  if (document.getElementById(UPDATE_RELOAD_OVERLAY_STYLE_ID)) { return; }

  const style = document.createElement('style');
  style.id = UPDATE_RELOAD_OVERLAY_STYLE_ID;
  style.textContent = `
    @keyframes smart-shopping-list-update-spin {
      to { transform: rotate(360deg); }
    }

    #${UPDATE_RELOAD_OVERLAY_ID} .pwa-update-spinner {
      animation: smart-shopping-list-update-spin 0.78s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      #${UPDATE_RELOAD_OVERLAY_ID} {
        transition: none !important;
      }

      #${UPDATE_RELOAD_OVERLAY_ID} .pwa-update-spinner {
        animation: none;
      }
    }
  `;
  document.head.append(style);
};

const createUpdateReloadOverlay = (initialOpacity = '0'): HTMLDivElement => {
  const existingOverlay = document.getElementById(UPDATE_RELOAD_OVERLAY_ID);
  if (existingOverlay instanceof HTMLDivElement) { return existingOverlay; }

  ensureUpdateReloadOverlayStyles();
  const overlay = document.createElement('div');
  overlay.id = UPDATE_RELOAD_OVERLAY_ID;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', createMessages(loadLocale()).pwaInstall.updateReloadLabel);
  overlay.innerHTML = '<span class="pwa-update-spinner" aria-hidden="true"></span>';
  overlay.style.cssText = [
    'align-items:center',
    'backdrop-filter:blur(1px)',
    'background:color-mix(in srgb, var(--bg, #f6f7fb) 72%, transparent)',
    'display:flex',
    'inset:0',
    'justify-content:center',
    `opacity:${initialOpacity}`,
    'padding:32px',
    'position:fixed',
    `transition:opacity ${UPDATE_RELOAD_FADE_MS}ms ease`,
    'z-index:2147483647',
  ].join(';');

  const spinner = overlay.querySelector<HTMLElement>('.pwa-update-spinner');
  if (spinner) {
    spinner.style.cssText = [
      'background:var(--panel, #ffffff)',
      'border:4px solid var(--border, #d9deea)',
      'border-radius:999px',
      'border-top-color:var(--primary, #2563eb)',
      'box-shadow:0 12px 32px var(--shadow-color, rgba(15, 23, 42, 0.16))',
      'display:block',
      'height:44px',
      'width:44px',
    ].join(';');
  }

  document.body.append(overlay);
  return overlay;
};

export const fadeInUpdateReloadOverlay = (): void => {
  const overlay = createUpdateReloadOverlay('0');
  window.requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });
};

export const fadeOutUpdateReloadOverlay = (): void => {
  const overlay = document.getElementById(UPDATE_RELOAD_OVERLAY_ID);
  if (!(overlay instanceof HTMLDivElement)) { return; }

  window.requestAnimationFrame(() => {
    overlay.style.opacity = '0';
    window.setTimeout(() => overlay.remove(), UPDATE_RELOAD_FADE_MS);
  });
};

export const showUpdateReloadOverlayForReload = (): void => {
  writeUpdateReloadSessionFlag();
  fadeInUpdateReloadOverlay();
};

export const hideUpdateReloadOverlayAfterReload = (): void => {
  if (!readUpdateReloadSessionFlag()) { return; }

  clearUpdateReloadSessionFlag();
  createUpdateReloadOverlay('1');
  fadeOutUpdateReloadOverlay();
};

export const previewUpdateReloadOverlay = (visibleMs = 1_400): void => {
  fadeInUpdateReloadOverlay();
  window.setTimeout(fadeOutUpdateReloadOverlay, visibleMs);
};
