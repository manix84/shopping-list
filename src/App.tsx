import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRY_CONFIGS } from './config/countries';
import { AppHeader } from './components/AppHeader';
import { PredatorEasterEgg } from './components/PredatorEasterEgg';
import { PwaInstallBadge } from './components/PwaInstallBadge';
import { PwaSplashScreen } from './components/PwaSplashScreen';
import { SecretAisleEasterEgg } from './components/SecretAisleEasterEgg';
import { ToastPopup, type ToastPopupData } from './components/ToastPopup';
import {
  runCountQuantityTests,
  runConfigTests,
  runMatcherTests,
  runMeasurementTests,
  runStateTests,
  runStorageTests,
  runUnitQuantityTests,
  runVariantTests,
} from './lib/debugTests';
import { loadDebugMode, loadDebugSettings, saveDebugMode, saveDebugSettings } from './lib/debugModePreference';
import {
  applyDocumentLocale,
  createMessages,
  I18nProvider,
  loadLocale,
  saveLocale,
} from './lib/i18n';
import {
  loadMeasurementDisplayMode,
  saveMeasurementDisplayMode,
  withMeasurementDisplayMode,
} from './lib/ingredientMode';
import {
  browserNotificationPermission,
  loadNotificationsEnabled,
  saveNotificationsEnabled,
} from './lib/notificationPreference';
import { getDisplayValue, getStoredValue, parseItems } from './lib/parser';
import {
  checkBackendStatus,
  clearSharedShoppingList,
  loadSharedShoppingList,
  saveSharedShoppingList,
  sharedShoppingListEventsUrl,
} from './lib/repository/apiRepository';
import {
  defaultRecord,
  hasStoredShoppingListRecord,
  localStorageRepository,
} from './lib/repository/localStorageRepository';
import { sharedListHistoryRepository } from './lib/repository/sharedListHistoryRepository';
import { chooseNewestRecord } from './lib/repository/recordMerge';
import { isDefaultLandingRoutePath, readRouteFromLocationParts, routeToUrl } from './lib/routing';
import { getSectionMeta } from './lib/sections';
import { extractSharedListId } from './lib/sharedLinks';
import { cleanLine, stripDisplaySizeLabel } from './lib/stringUtils';
import { loadRouteViewMode, saveRouteViewMode } from './lib/routeViewPreference';
import { getResolvedTheme, loadThemeMode, saveThemeMode } from './lib/themePreference';
import { previewUpdateReloadOverlay, showUpdateReloadOverlayForReload, UPDATE_RELOAD_FADE_MS } from './lib/updateReloadOverlay';
import { createUuidV7 } from './lib/uuid';
import { appVersion } from './version';
import { formatCountQuantity } from './lib/quantity';
import { extractVariant } from './lib/variant';
import { AboutPage } from './pages/AboutPage';
import { DebugPage } from './pages/DebugPage';
import { EditPage } from './pages/EditPage';
import { ErrorPage } from './pages/ErrorPage';
import { RoutePage } from './pages/RoutePage';
import { SectionsPage } from './pages/SectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AppRoute, BackendHeartbeatSample, BackendOperationStatus, BackendStatus, CountryCode, DebugEventTestKey, DebugNotificationDeliveryPath, DebugNotificationResult, DebugNotificationTestKey, DebugSettings, DebugTabKey, GroupedSectionView, Item, MeasurementDisplayMode, PageKey, RouteViewMode, SaveStatus, SectionKey, SharedListHistoryEntry, ShoppingListRecord, ThemeMode } from './types';

const DEFAULT_PAGE: PageKey = 'edit';
const BACKEND_HEARTBEAT_CONNECTED_MS = 5_000;
const BACKEND_HEARTBEAT_RETRY_MS = 1_500;
const BACKEND_HEARTBEAT_HISTORY_LIMIT = 36;
const SHARED_LIST_NOTIFICATION_POLL_MS = 30_000;
const SHARED_LIST_SYNC_POLL_MS = 5_000;
const SHARED_LIST_SYNC_SSE_FALLBACK_POLL_MS = 60_000;
const SHARED_LIST_NOTIFICATION_GROUP_MS = 2 * 60_000;
const SHARED_LIST_NOTIFICATION_PREVIEW_LIMIT = 3;
const NOTIFICATION_SERVICE_WORKER_READY_TIMEOUT_MS = 3_000;
const NOTIFICATION_WORKER_SCOPE_PATH = 'notification-worker/';
const NOTIFICATION_WORKER_SCRIPT_PATH = 'notification-sw.js';
const DEBUG_NOTIFICATION_LIST_ID = 'debug-notifications';
const DEBUG_MODE_NOTICE_DURATION_MS = 4_000;
const DEV_TITLE_SUFFIX = ' [Dev]';
const DEV_MANIFEST_ID = 'smart-shopping-list-dev';
const APP_VERSION_RELOAD_SESSION_KEY = 'smart-shopping-list-version-reload-v1';
type NotificationDeliveryResult = DebugNotificationDeliveryPath;
const debugNotificationStatusFromDelivery = (
  result: NotificationDeliveryResult,
): DebugNotificationResult['status'] => {
  if (result === 'failed') { return 'failed'; }
  if (result === 'blocked') { return 'blocked'; }
  return 'shown';
};
const PWA_INSTALL_NUDGE_DISMISSED_KEY = 'smart-shopping-list-pwa-install-nudge-dismissed-v1';
const PWA_INSTALL_PROMPT_SETTLE_MS = 1_200;
const KONAMI_SEQUENCE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'] as const;
const KONAMI_TOUCH_SWIPE_MIN_PX = 42;
const KONAMI_TOUCH_TAP_MAX_PX = 14;
const KONAMI_TOUCH_TAP_MAX_MS = 260;
const KONAMI_TOUCH_LOCK_START_INDEX = 2;
const KONAMI_TOUCH_SEQUENCE_TIMEOUT_MS = 1_600;
type StorageMode = 'local' | 'backend';
type RouteHistoryMode = 'push' | 'replace';
type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};
type ShareErrorKey =
  | 'connectBackendFirst'
  | 'createFailed'
  | 'invalidLink'
  | 'loadFailed'
  | 'loadMissing'
  | 'refreshMissing'
  | 'refreshFailed'
  | 'offlineBackup';
type SharedInputValidation =
  | { state: 'valid'; listId: string; normalizedValue: string }
  | { state: 'invalid' }
  | { state: 'missing'; listId: string; normalizedValue: string }
  | { state: 'unavailable' };
type SharedListNotificationGroup = {
  listId: string;
  itemIds: Set<string>;
  itemNames: string[];
  lastShownAt: number;
};
type CurrentShoppingListState = {
  input: string;
  items: Item[];
  countryCode: CountryCode;
  listId: string;
  serverBacked: boolean;
  listName: string;
  measurementDisplayMode: MeasurementDisplayMode;
};

const defaultBackendStatus = (): BackendStatus => ({
  state: 'checking',
  health: { ok: false },
  database: { ok: false },
});

const backendOperationStatus = (
  state: BackendOperationStatus['state'],
  detail?: string,
): BackendOperationStatus => ({
  state,
  detail,
  updatedAt: new Date().toISOString(),
});

const errorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const appBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
const currentOrigin = (): string | undefined => (typeof window === 'undefined' ? undefined : window.location.origin);

const isRunningInstalledPwa = (): boolean => {
  if (typeof window === 'undefined') { return false; }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
};

const absoluteManifestUrl = (value: unknown, manifestUrl: string): unknown =>
  typeof value === 'string' ? new URL(value, manifestUrl).href : value;

const absoluteManifestImageResources = (value: unknown, manifestUrl: string): unknown => {
  if (!Array.isArray(value)) { return value; }

  return value.map((entry) => {
    if (!entry || typeof entry !== 'object') { return entry; }

    return {
      ...entry,
      src: absoluteManifestUrl((entry as { src?: unknown }).src, manifestUrl),
    };
  });
};

const updateDevManifest = (appTitle: string): void => {
  if (!import.meta.env.DEV || typeof document === 'undefined') { return; }

  const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!manifestLink) { return; }

  const sourceManifestUrl = manifestLink.href.startsWith('blob:')
    ? new URL('manifest.webmanifest', window.location.href).href
    : manifestLink.href;

  fetch(sourceManifestUrl, { cache: 'no-store' })
    .then((response) => response.ok ? response.json() : undefined)
    .then((manifest: unknown) => {
      if (!manifest || typeof manifest !== 'object') { return; }

      const devManifest = {
        ...manifest,
        id: DEV_MANIFEST_ID,
        start_url: absoluteManifestUrl((manifest as { start_url?: unknown }).start_url, sourceManifestUrl),
        scope: absoluteManifestUrl((manifest as { scope?: unknown }).scope, sourceManifestUrl),
        icons: absoluteManifestImageResources((manifest as { icons?: unknown }).icons, sourceManifestUrl),
        screenshots: absoluteManifestImageResources((manifest as { screenshots?: unknown }).screenshots, sourceManifestUrl),
        name: `${appTitle}${DEV_TITLE_SUFFIX}`,
        short_name: `Shopping List${DEV_TITLE_SUFFIX}`,
      };
      const manifestBlob = new Blob([JSON.stringify(devManifest)], { type: 'application/manifest+json' });
      const previousHref = manifestLink.href.startsWith('blob:') ? manifestLink.href : undefined;
      manifestLink.href = URL.createObjectURL(manifestBlob);
      if (previousHref) {
        URL.revokeObjectURL(previousHref);
      }
    })
    .catch(() => {
      // Non-fatal: the dev install prompt can fall back to the static manifest.
    });
};

const isMobileOrTabletDevice = (): boolean => {
  if (typeof window === 'undefined') { return false; }

  return window.matchMedia('(hover: none), (pointer: coarse)').matches && window.matchMedia('(max-width: 1180px)').matches;
};

const isTextInputTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) { return false; }

  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
};

const konamiKeyFromEvent = (event: KeyboardEvent): (typeof KONAMI_SEQUENCE)[number] | undefined => {
  if (event.key === 'ArrowUp') { return 'up'; }
  if (event.key === 'ArrowDown') { return 'down'; }
  if (event.key === 'ArrowLeft') { return 'left'; }
  if (event.key === 'ArrowRight') { return 'right'; }
  if (event.key.toLowerCase() === 'b') { return 'b'; }
  if (event.key.toLowerCase() === 'a') { return 'a'; }
  return undefined;
};

const nextKonamiIndex = (currentIndex: number, input: (typeof KONAMI_SEQUENCE)[number]): number => {
  if (KONAMI_SEQUENCE[currentIndex] === input) {
    return currentIndex + 1;
  }

  return KONAMI_SEQUENCE[0] === input ? 1 : 0;
};

const hasDismissedPwaInstallNudge = (): boolean => {
  if (typeof window === 'undefined') { return false; }

  return window.localStorage.getItem(PWA_INSTALL_NUDGE_DISMISSED_KEY) === 'true';
};

const serviceWorkerReadyWithTimeout = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) { return undefined; }

  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<undefined>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(undefined), NOTIFICATION_SERVICE_WORKER_READY_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

const waitForServiceWorkerActivation = async (
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration | undefined> => {
  if (registration.active) { return registration; }

  const worker = registration.installing ?? registration.waiting;
  if (!worker) { return undefined; }

  return new Promise((resolve) => {
    let timeoutId: number | undefined;
    const finish = (nextRegistration: ServiceWorkerRegistration | undefined) => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      worker.removeEventListener('statechange', handleStateChange);
      resolve(nextRegistration);
    };
    const handleStateChange = () => {
      if (worker.state === 'activated') {
        finish(registration);
      }
    };

    timeoutId = window.setTimeout(() => finish(registration.active ? registration : undefined), NOTIFICATION_SERVICE_WORKER_READY_TIMEOUT_MS);
    worker.addEventListener('statechange', handleStateChange);
    handleStateChange();
  });
};

const serviceWorkerRegistrationForNotifications = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }

  const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  const appRegistration = await navigator.serviceWorker.getRegistration(appBaseUrl.href).catch(() => undefined);
  if (appRegistration?.active) {
    return appRegistration;
  }

  const notificationWorkerScope = new URL(NOTIFICATION_WORKER_SCOPE_PATH, appBaseUrl).href;
  const notificationRegistration = await navigator.serviceWorker
    .getRegistration(notificationWorkerScope)
    .catch(() => undefined);
  if (notificationRegistration?.active) {
    return notificationRegistration;
  }

  if (window.isSecureContext) {
    const notificationWorkerScript = new URL(NOTIFICATION_WORKER_SCRIPT_PATH, appBaseUrl).href;
    const registeredNotificationWorker = await navigator.serviceWorker
      .register(notificationWorkerScript, { scope: notificationWorkerScope, updateViaCache: 'none' })
      .catch(() => undefined);
    if (registeredNotificationWorker) {
      return waitForServiceWorkerActivation(registeredNotificationWorker);
    }
  }

  return serviceWorkerReadyWithTimeout();
};

const updateBrowserIcon = (theme: 'light' | 'dark'): void => {
  if (typeof document === 'undefined') { return; }

  const iconLink = document.querySelector<HTMLLinkElement>('#browser-theme-icon');
  const nextIcon = theme === 'dark' ? iconLink?.dataset.darkHref : iconLink?.dataset.lightHref;
  if (iconLink && nextIcon) {
    iconLink.href = nextIcon;
  }
};

const readRouteFromLocation = (): AppRoute => {
  if (typeof window === 'undefined') { return { page: DEFAULT_PAGE }; }

  return readRouteFromLocationParts({
    pathname: window.location.pathname,
    basePath: appBasePath,
  });
};

const isDefaultLandingLocation = (): boolean => {
  if (typeof window === 'undefined') { return true; }

  return isDefaultLandingRoutePath({
    pathname: window.location.pathname,
    basePath: appBasePath,
  });
};

const routesMatch = (first: AppRoute, second: AppRoute): boolean =>
  first.page === second.page &&
  first.listId === second.listId &&
  first.debugTab === second.debugTab;

const syncRouteToUrl = ({ page, listId, debugTab }: AppRoute, mode: RouteHistoryMode): void => {
  if (typeof window === 'undefined') { return; }

  const nextUrl = routeToUrl({ page, listId, debugTab }, appBasePath);
  const currentUrl = window.location.pathname;
  if (currentUrl !== nextUrl) {
    window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', nextUrl);
  }
};

const buildRecord = (
  input: string,
  items: Item[],
  countryCode: CountryCode,
  listId: string,
  serverBacked: boolean,
  listName: string,
): ShoppingListRecord => ({
  listId,
  serverBacked,
  listName: listName.trim() || undefined,
  input,
  items,
  updatedAt: new Date().toISOString(),
  countryCode,
});

const countryConfigForMeasurementDisplayMode = (
  countryCode: CountryCode,
  displayMode: MeasurementDisplayMode,
) => withMeasurementDisplayMode(COUNTRY_CONFIGS[countryCode], displayMode);

const getSharedListPreview = (items: Item[]): string[] => items.slice(0, 6).map((item) => item.raw);

const recordFromCurrentState = ({
  input,
  items,
  countryCode,
  listId,
  serverBacked,
  listName,
  updatedAt,
}: {
  input: string;
  items: Item[];
  countryCode: CountryCode;
  listId: string;
  serverBacked: boolean;
  listName: string;
  updatedAt?: string;
}): ShoppingListRecord => ({
  listId,
  serverBacked,
  listName: listName.trim() || undefined,
  input,
  items,
  updatedAt: updatedAt ?? new Date().toISOString(),
  countryCode,
});

const recordMatchesCurrentState = (
  record: ShoppingListRecord | undefined,
  {
    input,
    items,
    countryCode,
    listId,
    serverBacked,
    listName,
  }: {
    input: string;
    items: Item[];
    countryCode: CountryCode;
    listId: string;
    serverBacked: boolean;
    listName: string;
  },
): record is ShoppingListRecord =>
  record !== undefined &&
  record.listId === listId &&
  record.input === input &&
  record.countryCode === countryCode &&
  record.serverBacked === serverBacked &&
  (record.listName ?? undefined) === (listName.trim() || undefined) &&
  JSON.stringify(record.items) === JSON.stringify(items);

const timestampValue = (value: string | undefined): number => {
  const parsed = Date.parse(value ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
};

const sessionValue = (key: string): string | undefined => {
  try {
    return window.sessionStorage.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const saveSessionValue = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Non-fatal: callers should still complete their primary action without persistence.
  }
};

function updateItemTextInInput(input: string, previousDisplay: string, nextDisplay: string): string {
  const lines = input.split('\n');
  const index = lines.findIndex((line) => cleanLine(line) === cleanLine(previousDisplay));
  if (index === -1) { return input; }
  const next = [...lines];
  next[index] = nextDisplay;
  return next.join('\n');
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => readRouteFromLocation());
  const [input, setInput] = useState('');
  const [listName, setListName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [isRouteFilterVisible, setIsRouteFilterVisible] = useState(false);
  const [draftItem, setDraftItem] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(() => defaultBackendStatus());
  const [backendOperation, setBackendOperation] = useState<BackendOperationStatus>(() => backendOperationStatus('idle'));
  const [backendHeartbeatSamples, setBackendHeartbeatSamples] = useState<BackendHeartbeatSample[]>([]);
  const [activeListId, setActiveListId] = useState<string>(() => readRouteFromLocation().listId ?? createUuidV7());
  const [isServerBackedList, setIsServerBackedList] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('uk');
  const [measurementDisplayMode, setMeasurementDisplayMode] = useState<MeasurementDisplayMode>(
    () => loadMeasurementDisplayMode(),
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [routeViewMode, setRouteViewMode] = useState<RouteViewMode>(() => loadRouteViewMode());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getResolvedTheme(loadThemeMode()));
  const [locale, setLocale] = useState(() => loadLocale());
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => loadNotificationsEnabled());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    () => browserNotificationPermission(),
  );
  const [isDebugMode, setIsDebugMode] = useState(() => loadDebugMode());
  const [debugSettings, setDebugSettings] = useState<DebugSettings>(() => loadDebugSettings());
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [isRefreshingSharedList, setIsRefreshingSharedList] = useState(false);
  const [isLoadingSharedList, setIsLoadingSharedList] = useState(false);
  const [shareError, setShareError] = useState<ShareErrorKey>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [sharedListHistory, setSharedListHistory] = useState<SharedListHistoryEntry[]>(() => sharedListHistoryRepository.load());
  const [beforeInstallPromptEvent, setBeforeInstallPromptEvent] = useState<BeforeInstallPromptEvent>();
  const [hasInstallPromptCheckSettled, setHasInstallPromptCheckSettled] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => isRunningInstalledPwa());
  const [isPwaInstallNudgeVisible, setIsPwaInstallNudgeVisible] = useState(() => !hasDismissedPwaInstallNudge());
  const [isLikelyMobileForInstall, setIsLikelyMobileForInstall] = useState(() => isMobileOrTabletDevice());
  const [isSecretAisleEasterEggVisible, setIsSecretAisleEasterEggVisible] = useState(false);
  const [predatorEasterEggRun, setPredatorEasterEggRun] = useState(0);
  const [debugNotificationResult, setDebugNotificationResult] = useState<DebugNotificationResult>();
  const [debugModeNotice, setDebugModeNotice] = useState<ToastPopupData>();
  const [backendSaveRetryAttempt, setBackendSaveRetryAttempt] = useState(0);
  const currentItemsRef = useRef<Item[]>([]);
  const sharedListNotificationSeenUpdatedAtRef = useRef<Record<string, string>>({});
  const sharedListNotificationGroupRef = useRef<SharedListNotificationGroup>();
  const debugNotificationListIdRef = useRef(DEBUG_NOTIFICATION_LIST_ID);
  const saveRequestIdRef = useRef(0);
  const lastLocalPersistedRecordRef = useRef<ShoppingListRecord>();
  const lastBackendPersistedRecordRef = useRef<ShoppingListRecord>();
  const pendingBackendSaveRecordRef = useRef<ShoppingListRecord>();
  const currentShoppingListStateRef = useRef<CurrentShoppingListState>();
  const nextRouteHistoryModeRef = useRef<RouteHistoryMode>('replace');
  const shouldResolveDefaultLandingRef = useRef(isDefaultLandingLocation());
  const appVersionReloadRequestedRef = useRef(false);
  const pendingAppVersionReloadRef = useRef<string>();
  const skipNextAutosaveRef = useRef(false);
  const remoteSyncStatusTimerRef = useRef<number>();
  const suppressNextAutosaveStatusRef = useRef(true);
  const suppressNextAutosaveStatus = () => {
    suppressNextAutosaveStatusRef.current = true;
    skipNextAutosaveRef.current = true;
    setSaveStatus('idle');
  };

  const updateRoute = useCallback((
    nextRoute: AppRoute | ((current: AppRoute) => AppRoute),
    historyMode: RouteHistoryMode = 'push',
  ) => {
    setRoute((current) => {
      const resolvedRoute = typeof nextRoute === 'function' ? nextRoute(current) : nextRoute;
      if (routesMatch(current, resolvedRoute)) {
        return current;
      }

      nextRouteHistoryModeRef.current = historyMode;
      return resolvedRoute;
    });
  }, []);

  const config = useMemo(
    () => withMeasurementDisplayMode(COUNTRY_CONFIGS[countryCode], measurementDisplayMode),
    [countryCode, measurementDisplayMode],
  );
  const messages = useMemo(() => createMessages(locale), [locale]);
  const { page, listId } = route;
  const visiblePage: PageKey = page === 'debug' && !isDebugMode ? 'not-found' : page;
  const activeDebugTab: DebugTabKey = page === 'debug' ? route.debugTab ?? 'parsed' : 'parsed';
  const canUseBackend = backendStatus.state === 'connected' && !debugSettings.forceLocalStorage;
  const canCreateSharedLink = items.length > 0 || cleanLine(input).length > 0;
  const shareLink =
    typeof window === 'undefined' || !canUseBackend || !isServerBackedList
      ? undefined
      : `${window.location.origin}${appBasePath}/list/${activeListId}/edit`;
  const currentSharedListDatabaseEntry = useMemo(() => {
    if (!canUseBackend || !isServerBackedList || storageMode !== 'backend') { return undefined; }

    const persistedRecord = lastBackendPersistedRecordRef.current;
    const persistedUpdatedAt = persistedRecord?.updatedAt;
    const record = recordMatchesCurrentState(persistedRecord, {
      input,
      items,
      countryCode,
      listId: activeListId,
      serverBacked: isServerBackedList,
      listName,
    })
      ? persistedRecord
      : recordFromCurrentState({
          input,
          items,
          countryCode,
          listId: activeListId,
          serverBacked: isServerBackedList,
          listName,
          updatedAt: persistedUpdatedAt,
        });
    return {
      id: activeListId,
      exists: true,
      record,
      updatedAt: record.updatedAt,
    };
  }, [activeListId, canUseBackend, countryCode, input, isServerBackedList, items, listName, storageMode]);
  const shareErrorMessage = shareError ? messages.sharing[shareError] : undefined;

  const canAutoReloadWithoutInterrupting = () =>
    typeof document === 'undefined' ||
    document.visibilityState !== 'visible' ||
    (typeof document.hasFocus === 'function' && !document.hasFocus());

  const requestAppVersionReload = useCallback((backendVersion: string | undefined, force = false) => {
    if (
      !backendVersion ||
      backendVersion === appVersion ||
      appVersionReloadRequestedRef.current ||
      (!force && sessionValue(APP_VERSION_RELOAD_SESSION_KEY) === backendVersion)
    ) { return; }

    if (!force && !canAutoReloadWithoutInterrupting()) {
      pendingAppVersionReloadRef.current = backendVersion;
      return;
    }

    appVersionReloadRequestedRef.current = true;
    pendingAppVersionReloadRef.current = undefined;
    saveSessionValue(APP_VERSION_RELOAD_SESSION_KEY, backendVersion);
    showUpdateReloadOverlayForReload();
    window.setTimeout(() => window.location.reload(), UPDATE_RELOAD_FADE_MS);
  }, []);

  useEffect(() => {
    const flushPendingAppVersionReload = () => {
      if (canAutoReloadWithoutInterrupting()) {
        requestAppVersionReload(pendingAppVersionReloadRef.current);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        flushPendingAppVersionReload();
      }
    };

    window.addEventListener('blur', flushPendingAppVersionReload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', flushPendingAppVersionReload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestAppVersionReload]);

  useEffect(() => {
    currentItemsRef.current = items;
  }, [items]);

  useEffect(() => {
    currentShoppingListStateRef.current = {
      input,
      items,
      countryCode,
      listId: activeListId,
      serverBacked: isServerBackedList,
      listName,
      measurementDisplayMode,
    };
  }, [activeListId, countryCode, input, isServerBackedList, items, listName, measurementDisplayMode]);

  useEffect(() => () => {
    if (remoteSyncStatusTimerRef.current) {
      window.clearTimeout(remoteSyncStatusTimerRef.current);
      remoteSyncStatusTimerRef.current = undefined;
    }
  }, []);

  const changePage = (nextPage: PageKey) => {
    updateRoute((current) => ({
      ...current,
      page: nextPage,
      debugTab: nextPage === 'debug' ? current.debugTab ?? 'parsed' : undefined,
    }));
  };

  const changeDebugTab = (debugTab: DebugTabKey) => {
    updateRoute((current) => ({ ...current, page: 'debug', debugTab }));
  };

  const enableDebugMode = () => {
    const shouldNotifyEnabled = !isDebugMode;
    setIsDebugMode(true);
    if (shouldNotifyEnabled) {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'success',
        title: messages.pages.about.debugModeEnabledNoticeTitle,
        message: messages.pages.about.debugModeEnabledNotice,
      });
    }
    try {
      saveDebugMode(true);
    } catch (error) {
      console.warn('Unable to save debug mode preference.', error);
    }
  };

  const showAlreadyDebugModeNotice = () => {
    setDebugModeNotice({
      id: Date.now(),
      tone: 'info',
      title: messages.pages.about.debugModeAlreadyEnabledNoticeTitle,
      message: messages.pages.about.debugModeAlreadyEnabledNotice,
    });
  };

  const handleDebugModeChange = (enabled: boolean) => {
    setIsDebugMode(enabled);
    try {
      saveDebugMode(enabled);
    } catch (error) {
      console.warn('Unable to save debug mode preference.', error);
    }
  };

  const verboseDebugLog = useCallback((message: string, context?: Record<string, unknown>) => {
    if (!debugSettings.verboseConsoleDiagnostics) { return; }
    console.info(`[debug] ${message}`, context ?? {});
  }, [debugSettings.verboseConsoleDiagnostics]);

  const recordBackendHeartbeat = useCallback((status: BackendStatus, startedAt: number) => {
    const sample: BackendHeartbeatSample = {
      checkedAt: new Date().toISOString(),
      state: status.state,
      healthOk: status.health.ok,
      healthMode: status.health.mode,
      healthVersion: status.health.version,
      databaseOk: status.database.ok,
      adapter: status.database.adapter,
      databaseUpdatedAt: status.database.updatedAt,
      databaseSharedListCount: status.database.sharedListCount,
      databaseError: status.database.error,
      databaseErrorCode: status.database.errorCode,
      latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
    };

    setBackendHeartbeatSamples((current) => [...current, sample].slice(-BACKEND_HEARTBEAT_HISTORY_LIMIT));
    return sample;
  }, []);

  const handleDebugSettingChange = (key: keyof DebugSettings, enabled: boolean) => {
    setDebugSettings((current) => {
      const next = { ...current, [key]: enabled };
      try {
        saveDebugSettings(next);
      } catch (error) {
        console.warn('Unable to save debug settings preference.', error);
      }
      return next;
    });
  };

  const ensureNotificationPermission = useCallback(async () => {
    const currentPermission = browserNotificationPermission();
    if (currentPermission === 'unsupported' || currentPermission === 'denied') {
      setNotificationPermission(currentPermission);
      return false;
    }

    const nextPermission =
      currentPermission === 'default' && typeof window !== 'undefined' && 'Notification' in window
        ? await window.Notification.requestPermission()
        : currentPermission;

    setNotificationPermission(nextPermission);
    return nextPermission === 'granted';
  }, []);

  const handleNotificationsChange = async (enabled: boolean) => {
    if (!enabled) {
      saveNotificationsEnabled(false);
      setNotificationsEnabled(false);
      setNotificationPermission(browserNotificationPermission());
      return;
    }

    const granted = await ensureNotificationPermission();
    saveNotificationsEnabled(granted);
    setNotificationsEnabled(granted);
  };

  const showBrowserNotification = useCallback(async (
    title: string,
    options: NotificationOptions,
  ): Promise<NotificationDeliveryResult> => {
    if (browserNotificationPermission() !== 'granted') { return 'blocked'; }
    if (typeof window === 'undefined') { return 'failed'; }

    const registration = await serviceWorkerRegistrationForNotifications().catch(() => undefined);
    if (registration?.showNotification) {
      try {
        await registration.showNotification(title, options);
        return 'service-worker';
      } catch (error) {
        console.warn('Unable to show service worker notification. Falling back to page notification.', error);
      }
    }

    try {
      new window.Notification(title, options);
      return 'page';
    } catch (error) {
      console.warn('Unable to show page notification with full options. Retrying with minimal options.', error);
    }

    try {
      new window.Notification(title, {
        body: options.body,
        icon: options.icon,
      });
      return 'page';
    } catch (error) {
      console.warn('Unable to show page notification.', error);
      return 'failed';
    }
  }, []);

  const showDirectPageNotification = useCallback((title: string, body: string): NotificationDeliveryResult => {
    if (browserNotificationPermission() !== 'granted') { return 'blocked'; }
    if (typeof window === 'undefined' || !('Notification' in window)) { return 'failed'; }

    try {
      new window.Notification(title, { body });
      return 'page';
    } catch (error) {
      console.warn('Unable to show minimal page notification.', error);
      return 'failed';
    }
  }, []);

  const notifySharedListAdditions = useCallback(async (
    listId: string,
    addedItems: Item[],
    force = false,
  ): Promise<NotificationDeliveryResult> => {
    if ((!force && !notificationsEnabled) || addedItems.length === 0) { return 'blocked'; }
    if (typeof window === 'undefined') { return 'failed'; }

    const now = Date.now();
    const currentGroup = sharedListNotificationGroupRef.current;
    const shouldContinueGroup =
      currentGroup?.listId === listId && now - currentGroup.lastShownAt <= SHARED_LIST_NOTIFICATION_GROUP_MS;
    const nextGroup: SharedListNotificationGroup = shouldContinueGroup && currentGroup
      ? currentGroup
      : { listId, itemIds: new Set<string>(), itemNames: [], lastShownAt: now };

    addedItems.forEach((item) => {
      if (nextGroup.itemIds.has(item.id)) { return; }
      nextGroup.itemIds.add(item.id);
      nextGroup.itemNames.push(item.raw);
    });
    nextGroup.lastShownAt = now;
    sharedListNotificationGroupRef.current = nextGroup;

    const count = nextGroup.itemIds.size;
    if (count === 0) { return 'blocked'; }

    const title = messages.notifications.sharedItemsAddedTitle;
    const preview = messages.notifications.sharedItemsAddedPreview.replace(
      '{items}',
      nextGroup.itemNames.slice(0, SHARED_LIST_NOTIFICATION_PREVIEW_LIMIT).join(', '),
    );
    const body = count === 1
      ? messages.notifications.sharedItemAddedBody.replace('{item}', nextGroup.itemNames[0] ?? '')
      : `${messages.notifications.sharedItemsAddedBody.replace('{count}', String(count))} ${preview}`;
    const url = `${window.location.origin}${appBasePath}/list/${listId}/edit`;
    const options: NotificationOptions = {
      body,
      data: { url },
      icon: `${appBasePath}/icon-192.png`,
      silent: shouldContinueGroup,
      tag: `smart-shopping-list-${listId}-additions`,
    };

    return showBrowserNotification(title, options);
  }, [messages.notifications, notificationsEnabled, showBrowserNotification]);

  const debugNotificationItems = useCallback((kind: DebugNotificationTestKey): Item[] => {
    const namesByKind: Record<DebugNotificationTestKey, string[]> = {
      minimal: ['Milk'],
      'single-item': ['Milk'],
      'few-items': ['Milk', 'Eggs', 'Bananas'],
      'large-batch': ['Milk', 'Eggs', 'Bananas', 'Bread', 'Apples', 'Pasta', 'Tomatoes', 'Coffee', 'Rice', 'Yoghurt'],
      'silent-follow-up': ['Cheese', 'Butter'],
    };

    return namesByKind[kind].map((raw, index) => ({
      id: `debug-${kind}-${Date.now()}-${index}`,
      raw,
      normalized: raw.toLowerCase(),
      cleaned: raw.toLowerCase(),
      checked: false,
      matchedSection: 'other',
    }));
  }, []);

  const handleDebugNotificationTest = useCallback(async (kind: DebugNotificationTestKey) => {
    setDebugNotificationResult({ status: 'requesting', kind });
    const granted = await ensureNotificationPermission();
    if (!granted) {
      setDebugNotificationResult({
        status: 'blocked',
        kind,
        permission: browserNotificationPermission(),
      });
      return;
    }

    const currentNotificationContext = () => ({
      permission: browserNotificationPermission(),
      secureContext: window.isSecureContext,
      focus: document.hasFocus(),
      visibility: document.visibilityState,
    });

    if (kind === 'minimal') {
      const result = showDirectPageNotification(
        messages.notifications.debugTestTitle,
        messages.notifications.debugTestBody,
      );
      setDebugNotificationResult({
        status: debugNotificationStatusFromDelivery(result),
        kind,
        deliveryPath: result,
        ...currentNotificationContext(),
      });
      return;
    }

    if (kind !== 'silent-follow-up') {
      sharedListNotificationGroupRef.current = undefined;
      debugNotificationListIdRef.current = `${DEBUG_NOTIFICATION_LIST_ID}-${Date.now()}`;
    }

    const listId = debugNotificationListIdRef.current;
    const result = await notifySharedListAdditions(listId, debugNotificationItems(kind), true);
    setDebugNotificationResult({
      status: debugNotificationStatusFromDelivery(result),
      kind,
      deliveryPath: result,
      ...currentNotificationContext(),
    });
  }, [debugNotificationItems, ensureNotificationPermission, messages.notifications, notifySharedListAdditions, showDirectPageNotification]);

  const handleDebugEventTest = useCallback((kind: DebugEventTestKey) => {
    if (kind === 'toast-success') {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'success',
        title: messages.pages.debug.eventToastSuccessTitle,
        message: messages.pages.debug.eventToastSuccessMessage,
      });
      return;
    }
    if (kind === 'toast-info') {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'info',
        title: messages.pages.debug.eventToastInfoTitle,
        message: messages.pages.debug.eventToastInfoMessage,
      });
      return;
    }
    if (kind === 'toast-warning') {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'warning',
        title: messages.pages.debug.eventToastWarningTitle,
        message: messages.pages.debug.eventToastWarningMessage,
      });
      return;
    }
    if (kind === 'toast-error') {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'error',
        title: messages.pages.debug.eventToastErrorTitle,
        message: messages.pages.debug.eventToastErrorMessage,
      });
      return;
    }
    if (kind === 'toast-plain') {
      setDebugModeNotice({
        id: Date.now(),
        tone: 'info',
        message: messages.pages.debug.eventToastPlainMessage,
        showIcon: false,
      });
      return;
    }
    if (kind === 'pwa-install-nudge') {
      setIsPwaInstallNudgeVisible(true);
      return;
    }
    if (kind === 'pwa-update-overlay') {
      previewUpdateReloadOverlay();
      return;
    }
    if (kind === 'secret-aisle') {
      setIsSecretAisleEasterEggVisible(true);
      return;
    }
    setPredatorEasterEggRun((current) => current + 1);
  }, [messages.pages.debug]);

  const applyTheme = (mode: ThemeMode) => {
    if (typeof document === 'undefined') { return; }

    const resolved = getResolvedTheme(mode);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = resolved === 'dark' ? '#0b1220' : '#f6f7fb';
    }

    updateBrowserIcon(resolved);
  };

  const rememberSharedList = ({
    listId,
    listName,
    items,
    createdAt,
    updatedAt,
  }: {
    listId: string;
    listName?: string;
    items: Item[];
    createdAt?: string;
    updatedAt: string;
  }) => {
    setSharedListHistory(
      sharedListHistoryRepository.remember({
        listId,
        listName,
        itemPreview: getSharedListPreview(items),
        createdAt,
        updatedAt,
        viewedAt: new Date().toISOString(),
      }),
    );
  };

  useEffect(() => {
    if (debugSettings.disableEasterEggs) { return; }

    let sequenceIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let hasValidTouchStart = false;
    let sequenceResetTimer: number | undefined;
    let isTouchMoveListenerActive = false;

    function handleTouchMove(event: TouchEvent) {
      if (!hasValidTouchStart || isTextInputTarget(event.target)) { return; }

      event.preventDefault();
    }

    const addTouchMoveListener = () => {
      if (isTouchMoveListenerActive) { return; }

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      isTouchMoveListenerActive = true;
    };

    const removeTouchMoveListener = () => {
      if (!isTouchMoveListenerActive) { return; }

      window.removeEventListener('touchmove', handleTouchMove);
      isTouchMoveListenerActive = false;
    };

    const setKonamiTouchState = (isActive: boolean, isTapStage: boolean) => {
      document.documentElement.classList.toggle('konami-touch-active', isActive);
      document.documentElement.classList.toggle('konami-touch-tap-stage', isTapStage);
      if (isActive) {
        addTouchMoveListener();
      } else {
        removeTouchMoveListener();
      }
    };

    const resetTouchStart = () => {
      hasValidTouchStart = false;
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
    };

    const clearSequenceResetTimer = () => {
      if (sequenceResetTimer === undefined) { return; }

      window.clearTimeout(sequenceResetTimer);
      sequenceResetTimer = undefined;
    };

    const resetKonamiSequence = () => {
      sequenceIndex = 0;
      resetTouchStart();
      clearSequenceResetTimer();
      setKonamiTouchState(false, false);
    };

    const scheduleKonamiSequenceReset = () => {
      clearSequenceResetTimer();
      sequenceResetTimer = window.setTimeout(resetKonamiSequence, KONAMI_TOUCH_SEQUENCE_TIMEOUT_MS);
    };

    const acceptKonamiInput = (input: (typeof KONAMI_SEQUENCE)[number], source: 'keyboard' | 'touch') => {
      sequenceIndex = nextKonamiIndex(sequenceIndex, input);
      if (sequenceIndex >= KONAMI_SEQUENCE.length) {
        resetKonamiSequence();
        setPredatorEasterEggRun((current) => current + 1);
        return;
      }

      if (sequenceIndex === 0) {
        resetKonamiSequence();
        return;
      }

      const isTouchSequence = source === 'touch';
      setKonamiTouchState(
        isTouchSequence && sequenceIndex >= KONAMI_TOUCH_LOCK_START_INDEX,
        isTouchSequence && sequenceIndex >= KONAMI_SEQUENCE.length - 2,
      );
      scheduleKonamiSequenceReset();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputTarget(event.target)) { return; }

      const input = konamiKeyFromEvent(event);
      if (input) {
        acceptKonamiInput(input, 'keyboard');
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isTextInputTarget(event.target)) {
        resetTouchStart();
        return;
      }

      const touch = event.touches[0];
      hasValidTouchStart = true;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (isTextInputTarget(event.target) || !hasValidTouchStart) {
        resetTouchStart();
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        resetTouchStart();
        return;
      }

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const duration = Date.now() - touchStartTime;
      resetTouchStart();

      if (absX <= KONAMI_TOUCH_TAP_MAX_PX && absY <= KONAMI_TOUCH_TAP_MAX_PX && duration <= KONAMI_TOUCH_TAP_MAX_MS) {
        if (sequenceIndex >= KONAMI_SEQUENCE.length - 2) {
          event.preventDefault();
        }
        acceptKonamiInput(sequenceIndex === KONAMI_SEQUENCE.length - 2 ? 'b' : 'a', 'touch');
        return;
      }

      if (Math.max(absX, absY) < KONAMI_TOUCH_SWIPE_MIN_PX) { return; }

      if (absY > absX) {
        acceptKonamiInput(deltaY < 0 ? 'up' : 'down', 'touch');
        return;
      }

      acceptKonamiInput(deltaX < 0 ? 'left' : 'right', 'touch');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', resetKonamiSequence);

    return () => {
      clearSequenceResetTimer();
      setKonamiTouchState(false, false);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', resetKonamiSequence);
    };
  }, [debugSettings.disableEasterEggs]);

  useEffect(() => {
    if (!debugSettings.disableEasterEggs) { return; }

    setIsSecretAisleEasterEggVisible(false);
    setPredatorEasterEggRun(0);
  }, [debugSettings.disableEasterEggs]);

  const removeSharedListFromHistory = (nextListId: string) => {
    setSharedListHistory(sharedListHistoryRepository.remove(nextListId));
  };

  const loadSharedListById = async (nextListId: string): Promise<boolean> => {
    if (!canUseBackend) {
      setShareError('connectBackendFirst');
      verboseDebugLog('shared list load blocked', { listId: nextListId, forceLocalStorage: debugSettings.forceLocalStorage });
      return false;
    }

    setIsLoadingSharedList(true);
    setShareError(undefined);

    try {
      const remotePayload = await loadSharedShoppingList(nextListId);
      if (!remotePayload.exists) {
        setShareError('loadMissing');
        return false;
      }

      const record = { ...remotePayload.record, listId: nextListId, serverBacked: true };
      applyRecord(record);
      localStorageRepository.save(record);
      lastLocalPersistedRecordRef.current = record;
      lastBackendPersistedRecordRef.current = record;
      rememberSharedList({
        listId: nextListId,
        listName: record.listName,
        items: record.items,
        createdAt: remotePayload.createdAt,
        updatedAt: remotePayload.updatedAt ?? record.updatedAt,
      });
      setStorageMode('backend');
      setIsServerBackedList(true);
      updateRoute({ page: 'edit', listId: nextListId });
      setShareError(undefined);
      verboseDebugLog('shared list loaded', { listId: nextListId });
      return true;
    } catch (error) {
      console.warn('Unable to load shared list from input.', error);
      setShareError('loadFailed');
      return false;
    } finally {
      setIsLoadingSharedList(false);
    }
  };

  const handleLoadSharedInput = async (value: string): Promise<boolean> => {
    const nextListId = extractSharedListId(value, appBasePath, currentOrigin());
    if (!nextListId) {
      setShareError('invalidLink');
      return false;
    }

    return loadSharedListById(nextListId);
  };

  const validateSharedInput = async (value: string): Promise<SharedInputValidation> => {
    const nextListId = extractSharedListId(value, appBasePath, currentOrigin());
    if (!nextListId) {
      return { state: 'invalid' };
    }

    const normalizedValue = `${currentOrigin() ?? ''}${appBasePath}/list/${nextListId}/edit`;
    if (!canUseBackend) {
      return { state: 'unavailable' };
    }

    try {
      const remotePayload = await loadSharedShoppingList(nextListId);
      if (!remotePayload.exists) {
        return { state: 'missing', listId: nextListId, normalizedValue };
      }

      return { state: 'valid', listId: nextListId, normalizedValue };
    } catch {
      return { state: 'unavailable' };
    }
  };

  useEffect(() => {
    let cancelled = false;
    suppressNextAutosaveStatus();
    setIsLoaded(false);
    setShareError(undefined);

    const loadRecord = async () => {
      setBackendOperation(backendOperationStatus('loading'));
      const localRecord = localStorageRepository.load();
      const hasLocalRecord = hasStoredShoppingListRecord();
      const nextListId = listId ?? localRecord.listId ?? createUuidV7();
      const localRecordWithIdentity = {
        ...localRecord,
        listId: nextListId,
        serverBacked: !debugSettings.forceLocalStorage && (localRecord.serverBacked === true || Boolean(listId)),
      };
      let selectedRecord = localRecordWithIdentity;
      let nextStorageMode: StorageMode = 'local';
      let nextServerBacked = localRecordWithIdentity.serverBacked === true;
      let backendOperationRecorded = false;

      const initialHeartbeatStartedAt = performance.now();
      const initialBackendStatus = await checkBackendStatus();
      if (!cancelled) {
        setBackendStatus(initialBackendStatus);
        recordBackendHeartbeat(initialBackendStatus, initialHeartbeatStartedAt);
        requestAppVersionReload(initialBackendStatus.health.version);
      }

      if (initialBackendStatus.state !== 'connected' && nextServerBacked && !debugSettings.forceLocalStorage) {
        setShareError('offlineBackup');
      }

      if (
        initialBackendStatus.state === 'connected' &&
        !debugSettings.forceLocalStorage &&
        !debugSettings.disableAutoBackendReconnect
      ) {
        try {
          const remotePayload = await loadSharedShoppingList(nextListId);
          selectedRecord = {
            ...chooseNewestRecord({
              local: localRecordWithIdentity,
              remote: { ...remotePayload.record, listId: nextListId, serverBacked: true },
              hasLocalRecord,
              hasRemoteRecord: remotePayload.exists,
            }),
            listId: nextListId,
            serverBacked: true,
          };

          await saveSharedShoppingList(nextListId, selectedRecord);
          localStorageRepository.save(selectedRecord);
          lastLocalPersistedRecordRef.current = selectedRecord;
          lastBackendPersistedRecordRef.current = selectedRecord;
          if (remotePayload.exists) {
            rememberSharedList({
              listId: nextListId,
              listName: selectedRecord.listName,
              items: selectedRecord.items,
              createdAt: remotePayload.createdAt,
              updatedAt: remotePayload.updatedAt ?? selectedRecord.updatedAt,
            });
          }
          nextStorageMode = 'backend';
          nextServerBacked = true;
          setBackendOperation(backendOperationStatus('backend'));
          backendOperationRecorded = true;
        } catch (error) {
          console.warn('Backend was detected but could not be loaded. Falling back to local storage.', error);
          setBackendOperation(backendOperationStatus('local-fallback', errorMessage(error)));
          backendOperationRecorded = true;
        }
      }

      if (cancelled) { return; }

      setStorageMode(nextStorageMode);
      if (!backendOperationRecorded && nextStorageMode === 'local') {
        setBackendOperation(backendOperationStatus('local-fallback'));
      }
      const nextItems = parseItems(
        selectedRecord.input,
        countryConfigForMeasurementDisplayMode(selectedRecord.countryCode, measurementDisplayMode),
        selectedRecord.items,
      );
      const shouldResolveDefaultLanding = shouldResolveDefaultLandingRef.current;
      shouldResolveDefaultLandingRef.current = false;
      setActiveListId(nextListId);
      setIsServerBackedList(nextServerBacked);
      const currentLocationDebugTab = readRouteFromLocation().debugTab;
      updateRoute((current) => ({
        page: shouldResolveDefaultLanding ? (nextItems.length > 0 ? 'route' : 'edit') : current.page,
        listId: nextServerBacked ? nextListId : undefined,
        debugTab: current.debugTab ?? currentLocationDebugTab,
      }), 'replace');
      setCountryCode(selectedRecord.countryCode);
      setListName(selectedRecord.listName ?? '');
      setInput(selectedRecord.input);
      setItems(nextItems);
      lastLocalPersistedRecordRef.current = selectedRecord;
      if (nextStorageMode === 'backend') {
        lastBackendPersistedRecordRef.current = selectedRecord;
      } else {
        lastBackendPersistedRecordRef.current = undefined;
      }
      setIsLoaded(true);
    };

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [
    debugSettings.disableAutoBackendReconnect,
    debugSettings.forceLocalStorage,
    listId,
    recordBackendHeartbeat,
    requestAppVersionReload,
    updateRoute,
  ]);

  useEffect(() => {
    if (!isLoaded || debugSettings.pauseBackendHeartbeat) { return; }

    let cancelled = false;
    let inFlight = false;
    let timeoutId: number | undefined;
    let pendingCheck = false;

    const isHeartbeatVisible = () => document.visibilityState === 'visible';

    const clearHeartbeatTimer = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const scheduleHeartbeat = (delay: number) => {
      clearHeartbeatTimer();
      if (!isHeartbeatVisible()) { return; }

      timeoutId = window.setTimeout(() => {
        void runHeartbeat();
      }, delay);
    };

    const runHeartbeat = async () => {
      if (cancelled || !isHeartbeatVisible()) { return; }

      if (inFlight) {
        pendingCheck = true;
        return;
      }

      inFlight = true;

      try {
        const heartbeatStartedAt = performance.now();
        const nextBackendStatus = await checkBackendStatus();
        if (cancelled || !isHeartbeatVisible()) { return; }

        setBackendStatus(nextBackendStatus);
        const sample = recordBackendHeartbeat(nextBackendStatus, heartbeatStartedAt);
        requestAppVersionReload(nextBackendStatus.health.version);
        verboseDebugLog('backend heartbeat', {
          state: nextBackendStatus.state,
          adapter: nextBackendStatus.database.adapter,
          latencyMs: sample.latencyMs,
        });
        scheduleHeartbeat(
          nextBackendStatus.state === 'connected' ? BACKEND_HEARTBEAT_CONNECTED_MS : BACKEND_HEARTBEAT_RETRY_MS,
        );
      } finally {
        inFlight = false;

        if (pendingCheck && !cancelled) {
          pendingCheck = false;
          scheduleHeartbeat(0);
        }
      }
    };

    const requestImmediateHeartbeat = () => {
      if (!isHeartbeatVisible()) { return; }
      scheduleHeartbeat(0);
    };

    const handleHeartbeatVisibilityChange = () => {
      if (isHeartbeatVisible()) {
        requestImmediateHeartbeat();
      } else {
        clearHeartbeatTimer();
      }
    };

    scheduleHeartbeat(BACKEND_HEARTBEAT_CONNECTED_MS);
    window.addEventListener('focus', requestImmediateHeartbeat);
    window.addEventListener('online', requestImmediateHeartbeat);
    window.addEventListener('offline', requestImmediateHeartbeat);
    document.addEventListener('visibilitychange', handleHeartbeatVisibilityChange);

    return () => {
      cancelled = true;
      clearHeartbeatTimer();
      window.removeEventListener('focus', requestImmediateHeartbeat);
      window.removeEventListener('online', requestImmediateHeartbeat);
      window.removeEventListener('offline', requestImmediateHeartbeat);
      document.removeEventListener('visibilitychange', handleHeartbeatVisibilityChange);
    };
  }, [debugSettings.pauseBackendHeartbeat, isLoaded, recordBackendHeartbeat, requestAppVersionReload, verboseDebugLog]);

  useEffect(() => {
    if (
      !isLoaded ||
      storageMode === 'backend' ||
      backendStatus.state !== 'connected' ||
      debugSettings.forceLocalStorage ||
      debugSettings.disableAutoBackendReconnect
    ) { return; }

    const connectBackend = async () => {
      setBackendOperation(backendOperationStatus('reconnecting'));
      try {
        const localRecord = localStorageRepository.load();
        const remotePayload = await loadSharedShoppingList(activeListId);
        const selectedRecord = {
          ...chooseNewestRecord({
            local: { ...localRecord, listId: activeListId, serverBacked: false },
            remote: { ...remotePayload.record, listId: activeListId, serverBacked: true },
            hasLocalRecord: hasStoredShoppingListRecord(),
            hasRemoteRecord: remotePayload.exists,
          }),
          listId: activeListId,
          serverBacked: true,
        };

        await saveSharedShoppingList(activeListId, selectedRecord);
        localStorageRepository.save(selectedRecord);
        lastLocalPersistedRecordRef.current = selectedRecord;
        lastBackendPersistedRecordRef.current = selectedRecord;
        if (remotePayload.exists) {
          rememberSharedList({
            listId: activeListId,
            listName: selectedRecord.listName,
            items: selectedRecord.items,
            createdAt: remotePayload.createdAt,
            updatedAt: remotePayload.updatedAt ?? selectedRecord.updatedAt,
          });
        }
        suppressNextAutosaveStatus();
        setStorageMode('backend');
        setIsServerBackedList(true);
        const currentLocationDebugTab = readRouteFromLocation().debugTab;
        updateRoute((current) => ({
          page: current.page,
          listId: activeListId,
          debugTab: current.debugTab ?? currentLocationDebugTab,
        }), 'replace');
        setCountryCode(selectedRecord.countryCode);
        setListName(selectedRecord.listName ?? '');
        setInput(selectedRecord.input);
        setItems(parseItems(
          selectedRecord.input,
          countryConfigForMeasurementDisplayMode(selectedRecord.countryCode, measurementDisplayMode),
          selectedRecord.items,
        ));
        setBackendOperation(backendOperationStatus('backend'));
      } catch (error) {
        console.warn('Backend reconnected but could not be merged. Staying in local storage mode.', error);
        setBackendOperation(backendOperationStatus('local-fallback', errorMessage(error)));
      }
    };

    void connectBackend();
  }, [
    activeListId,
    backendStatus.state,
    debugSettings.disableAutoBackendReconnect,
    debugSettings.forceLocalStorage,
    isLoaded,
    storageMode,
    updateRoute,
  ]);

  useEffect(() => {
    if (!isLoaded || !debugSettings.forceLocalStorage || storageMode === 'local') { return; }

    verboseDebugLog('forcing local storage mode', { activeListId });
    setStorageMode('local');
    setIsServerBackedList(false);
    updateRoute((current) => ({ page: current.page, debugTab: current.debugTab, listId: current.listId }), 'replace');
  }, [activeListId, debugSettings.forceLocalStorage, isLoaded, storageMode, updateRoute, verboseDebugLog]);

  useEffect(() => {
    const handleLocationChange = () => {
      nextRouteHistoryModeRef.current = 'replace';
      setRoute((current) => {
        const locationRoute = readRouteFromLocation();
        const landingPage: PageKey = currentItemsRef.current.length > 0 ? 'route' : 'edit';
        const next: AppRoute = isDefaultLandingLocation()
          ? { ...locationRoute, page: landingPage, listId: locationRoute.listId ?? current.listId }
          : locationRoute;
        return routesMatch(current, next) ? current : next;
      });
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    saveThemeMode(themeMode);
    applyTheme(themeMode);

    if (themeMode !== 'system' || typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    saveLocale(locale);
    applyDocumentLocale(locale);
    if (typeof document !== 'undefined') {
      document.title = import.meta.env.DEV ? `${messages.app.title}${DEV_TITLE_SUFFIX}` : messages.app.title;
      updateDevManifest(messages.app.title);
    }
  }, [locale, messages]);

  useEffect(() => {
    saveRouteViewMode(routeViewMode);
  }, [routeViewMode]);

  useEffect(() => {
    saveMeasurementDisplayMode(measurementDisplayMode);
  }, [measurementDisplayMode]);

  useEffect(() => {
    if (!debugSettings.showPwaInstallPrompts || typeof window === 'undefined') { return; }

    window.localStorage.removeItem(PWA_INSTALL_NUDGE_DISMISSED_KEY);
    setIsPwaInstallNudgeVisible(true);
  }, [debugSettings.showPwaInstallPrompts]);

  useEffect(() => {
    verboseDebugLog('route changed', { page, listId });
  }, [listId, page, verboseDebugLog]);

  useEffect(() => {
    verboseDebugLog('storage mode changed', { storageMode, isServerBackedList, activeListId });
  }, [activeListId, isServerBackedList, storageMode, verboseDebugLog]);

  useEffect(() => {
    if (!isLoaded) { return; }
    const saveRequestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = saveRequestId;
    const shouldSkipAutosave = skipNextAutosaveRef.current;
    skipNextAutosaveRef.current = false;
    const shouldReportSaveStatus = !suppressNextAutosaveStatusRef.current;
    suppressNextAutosaveStatusRef.current = false;
    const persistedRecordForAutosave =
      storageMode === 'backend' && canUseBackend
        ? lastBackendPersistedRecordRef.current
        : lastLocalPersistedRecordRef.current;

    if (shouldSkipAutosave || recordMatchesCurrentState(persistedRecordForAutosave, {
      input,
      items,
      countryCode,
      listId: activeListId,
      serverBacked: isServerBackedList,
      listName,
    })) {
      return;
    }

    if (shouldReportSaveStatus) {
      setSaveStatus('saving');
    }

    const record = buildRecord(input, items, countryCode, activeListId, isServerBackedList, listName);

    try {
      localStorageRepository.save(record);
      lastLocalPersistedRecordRef.current = record;
    } catch (error) {
      console.warn('Unable to save shopping list locally.', error);
      if (shouldReportSaveStatus && saveRequestIdRef.current === saveRequestId) {
        setSaveStatus('error');
      }
      return;
    }

    if (isServerBackedList) {
      rememberSharedList({
        listId: activeListId,
        listName: record.listName,
        items: record.items,
        updatedAt: record.updatedAt,
      });
    }

    if (storageMode === 'backend' && canUseBackend) {
      const backendRecord = { ...record, serverBacked: true };
      void saveSharedShoppingList(activeListId, backendRecord)
        .then(() => {
          lastBackendPersistedRecordRef.current = backendRecord;
          pendingBackendSaveRecordRef.current = undefined;
          if (shouldReportSaveStatus && saveRequestIdRef.current === saveRequestId) {
            setSaveStatus('saved');
          }
        })
        .catch((error: unknown) => {
          console.warn('Unable to save shared shopping list to backend.', error);
          pendingBackendSaveRecordRef.current = backendRecord;
          setBackendOperation(backendOperationStatus('save-failed', errorMessage(error)));
          if (shouldReportSaveStatus && saveRequestIdRef.current === saveRequestId) {
            setSaveStatus('error');
          }
          window.setTimeout(() => setBackendSaveRetryAttempt((current) => current + 1), SHARED_LIST_SYNC_POLL_MS);
        });
      return;
    }

    if (shouldReportSaveStatus) {
      setSaveStatus('saved');
    }
  }, [activeListId, canUseBackend, countryCode, input, isLoaded, isServerBackedList, items, listName, storageMode]);

  useEffect(() => {
    if (!isLoaded || storageMode !== 'backend' || !canUseBackend) { return; }

    const pendingRecord = pendingBackendSaveRecordRef.current;
    const currentState = currentShoppingListStateRef.current;
    if (!pendingRecord || !currentState || currentState.listId !== activeListId) { return; }

    if (!recordMatchesCurrentState(pendingRecord, currentState)) {
      pendingBackendSaveRecordRef.current = undefined;
      return;
    }

    let cancelled = false;
    void saveSharedShoppingList(activeListId, pendingRecord)
      .then(() => {
        if (cancelled) { return; }

        lastBackendPersistedRecordRef.current = pendingRecord;
        pendingBackendSaveRecordRef.current = undefined;
        setSaveStatus('saved');
      })
      .catch((error: unknown) => {
        if (cancelled) { return; }

        console.warn('Unable to retry shared shopping list backend save.', error);
        setBackendOperation(backendOperationStatus('save-failed', errorMessage(error)));
        setSaveStatus('error');
        window.setTimeout(() => setBackendSaveRetryAttempt((current) => current + 1), SHARED_LIST_SYNC_POLL_MS);
      });

    return () => {
      cancelled = true;
    };
  }, [activeListId, backendSaveRetryAttempt, canUseBackend, isLoaded, storageMode]);

  useEffect(() => {
    if (
      !isLoaded ||
      !notificationsEnabled ||
      notificationPermission !== 'granted' ||
      !isServerBackedList ||
      storageMode !== 'backend' ||
      !canUseBackend
    ) { return; }

    let cancelled = false;
    const checkForRemoteAdditions = async () => {
      try {
        const remotePayload = await loadSharedShoppingList(activeListId);
        if (cancelled || !remotePayload.exists) { return; }

        const remoteUpdatedAt = remotePayload.updatedAt ?? remotePayload.record.updatedAt;
        const lastSeenUpdatedAt = sharedListNotificationSeenUpdatedAtRef.current[activeListId];
        sharedListNotificationSeenUpdatedAtRef.current[activeListId] = remoteUpdatedAt;
        if (!lastSeenUpdatedAt || remoteUpdatedAt === lastSeenUpdatedAt) { return; }

        const currentItemIds = new Set(currentItemsRef.current.map((item) => item.id));
        const addedItems = remotePayload.record.items.filter((item) => !currentItemIds.has(item.id));
        if (addedItems.length === 0) { return; }
        if (document.visibilityState === 'visible' && document.hasFocus()) { return; }

        await notifySharedListAdditions(activeListId, addedItems);
      } catch (error) {
        verboseDebugLog('shared list notification check failed', { listId: activeListId, error });
      }
    };

    const intervalId = window.setInterval(() => {
      void checkForRemoteAdditions();
    }, SHARED_LIST_NOTIFICATION_POLL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        void checkForRemoteAdditions();
      }
    };

    void checkForRemoteAdditions();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    activeListId,
    canUseBackend,
    isLoaded,
    isServerBackedList,
    notificationPermission,
    notificationsEnabled,
    notifySharedListAdditions,
    storageMode,
    verboseDebugLog,
  ]);

  useEffect(() => {
    const historyMode = nextRouteHistoryModeRef.current;
    nextRouteHistoryModeRef.current = 'push';
    syncRouteToUrl(route, historyMode);
  }, [route]);

  useEffect(() => {
    if (isLoaded && page === 'route' && items.length === 0) {
      updateRoute((current) => ({ ...current, page: 'edit' }), 'replace');
    }
  }, [isLoaded, items.length, page, updateRoute]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setBeforeInstallPromptEvent(event as BeforeInstallPromptEvent);
      setHasInstallPromptCheckSettled(true);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setBeforeInstallPromptEvent(undefined);
      setIsPwaInstallNudgeVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    const timeoutId = window.setTimeout(() => setHasInstallPromptCheckSettled(true), PWA_INSTALL_PROMPT_SETTLE_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const widthQuery = window.matchMedia('(max-width: 1180px)');
    const syncInstallDevice = () => {
      setIsLikelyMobileForInstall(mediaQuery.matches && widthQuery.matches);
      setIsPwaInstalled(isRunningInstalledPwa());
    };

    syncInstallDevice();
    mediaQuery.addEventListener('change', syncInstallDevice);
    widthQuery.addEventListener('change', syncInstallDevice);

    return () => {
      mediaQuery.removeEventListener('change', syncInstallDevice);
      widthQuery.removeEventListener('change', syncInstallDevice);
    };
  }, []);

  const matcherTests = useMemo(() => runMatcherTests(config), [config]);
  const configTests = useMemo(() => runConfigTests(config), [config]);
  const countQuantityTests = useMemo(() => runCountQuantityTests(), []);
  const measurementTests = useMemo(() => runMeasurementTests(), []);
  const unitQuantityTests = useMemo(() => runUnitQuantityTests(), []);
  const variantTests = useMemo(() => runVariantTests(config), [config]);
  const storageTests = useMemo(() => runStorageTests(), []);

  const grouped = useMemo((): GroupedSectionView[] => {
    const filteredItems = items.filter((item) => getDisplayValue(item).toLowerCase().includes(query.toLowerCase()));
    const map = new Map<SectionKey, Item[]>();

    for (const item of filteredItems) {
      const existing = map.get(item.matchedSection) ?? [];
      existing.push(item);
      map.set(item.matchedSection, existing);
    }

    return [...map.entries()]
      .map(([key, sectionItems]) => {
        const meta = getSectionMeta(config, key);
        const complete = sectionItems.length > 0 && sectionItems.every((item) => item.checked);
        const checkedCount = sectionItems.filter((item) => item.checked).length;
        return {
          key,
          label: meta.label,
          groupLabel: meta.groupLabel,
          order: meta.order,
          items: [...sectionItems].sort((a, b) => Number(a.checked) - Number(b.checked) || a.raw.localeCompare(b.raw)),
          complete,
          checkedCount,
        };
      })
      .sort((a, b) => Number(a.complete) - Number(b.complete) || a.order - b.order || a.label.localeCompare(b.label));
  }, [config, items, query]);

  const total = items.length;
  const checkedTotal = items.filter((item) => item.checked).length;
  const progress = total === 0 ? 0 : Math.round((checkedTotal / total) * 100);
  const stateTests = useMemo(
    () =>
      runStateTests({
        input,
        items,
        config,
        countryCode,
        activeListId,
        isServerBackedList,
        checkedTotal,
      }),
    [activeListId, checkedTotal, config, countryCode, input, isServerBackedList, items],
  );

  const handleParse = () => {
    setItems((current) => parseItems(input, config, current));
    setQuery('');
    setIsRouteFilterVisible(false);
    changePage('route');
  };

  const handleSaveAndStay = () => {
    setItems((current) => parseItems(input, config, current));
    setQuery('');
    setIsRouteFilterVisible(false);
  };

  const handleAddSingleItem = () => {
    const cleaned = cleanLine(draftItem);
    if (!cleaned) { return; }

    const nextInput = input.trim() ? `${input.trim()}\n${cleaned}` : cleaned;
    setInput(nextInput);
    setItems((current) => parseItems(nextInput, config, current));
    setDraftItem('');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) { return current; }

      const nextItems = current.filter((item) => item.id !== itemId);
      const targetDisplay = getStoredValue(target);
      const nextInput = input
        .split('\n')
        .filter((line) => cleanLine(line) !== cleanLine(targetDisplay))
        .join('\n');

      setInput(nextInput);
      return nextItems;
    });
  };

  const handleRenameItem = (itemId: string, nextRaw: string) => {
    const cleanedRaw = stripDisplaySizeLabel(cleanLine(nextRaw));
    if (!cleanedRaw) { return; }

    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) { return current; }
      const nextRawVariant = extractVariant(cleanedRaw, config).variant;

      const nextStoredValue = [
        target.size,
        typeof target.quantityValue === 'number' ? formatCountQuantity(target.quantityValue) : undefined,
        nextRawVariant ? undefined : target.variant,
        cleanedRaw,
        target.quantity,
      ].filter(Boolean).join(' ');
      const nextInput = updateItemTextInInput(input, getStoredValue(target), nextStoredValue);
      setInput(nextInput);
      return parseItems(nextInput, config, current);
    });
  };

  const handleCountryChange = (nextCountryCode: CountryCode) => {
    setCountryCode(nextCountryCode);
    setItems((current) => parseItems(
      input,
      countryConfigForMeasurementDisplayMode(nextCountryCode, measurementDisplayMode),
      current,
    ));
  };

  const handleMeasurementDisplayModeChange = (displayMode: MeasurementDisplayMode) => {
    setMeasurementDisplayMode(displayMode);
    setItems((current) => parseItems(input, countryConfigForMeasurementDisplayMode(countryCode, displayMode), current));
  };

  const toggleItem = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const toggleSection = (sectionKey: SectionKey, checked: boolean) => {
    setItems((current) => current.map((item) => (item.matchedSection === sectionKey ? { ...item, checked } : item)));
  };

  const resetChecks = () => {
    setItems((current) => current.map((item) => ({ ...item, checked: false })));
  };

  const toggleRouteFilter = () => {
    setIsRouteFilterVisible((current) => {
      if (current) {
        setQuery('');
      }
      return !current;
    });
  };

  const applyRecord = (record: ShoppingListRecord) => {
    suppressNextAutosaveStatus();
    lastLocalPersistedRecordRef.current = record;
    if (record.serverBacked === true) {
      lastBackendPersistedRecordRef.current = record;
    }
    if (record.listId) {
      setActiveListId(record.listId);
    }
    setIsServerBackedList(record.serverBacked === true);
    setCountryCode(record.countryCode);
    setListName(record.listName ?? '');
    setInput(record.input);
    setItems(parseItems(
      record.input,
      countryConfigForMeasurementDisplayMode(record.countryCode, measurementDisplayMode),
      record.items,
    ));
  };

  useEffect(() => {
    if (!isLoaded || !isServerBackedList || storageMode !== 'backend' || !canUseBackend) { return; }

    let cancelled = false;
    let inFlight = false;
    let isSseOpen = false;
    let lastFallbackPollAt = 0;
    const syncRemoteRecord = async () => {
      if (cancelled || inFlight) { return; }
      const currentState = currentShoppingListStateRef.current;
      if (!currentState || currentState.listId !== activeListId || !currentState.serverBacked) { return; }

      if (!recordMatchesCurrentState(lastBackendPersistedRecordRef.current, currentState)) {
        return;
      }

      inFlight = true;
      try {
        const remotePayload = await loadSharedShoppingList(activeListId);
        if (cancelled || !remotePayload.exists) { return; }

        const remoteUpdatedAt = remotePayload.updatedAt ?? remotePayload.record.updatedAt;
        const localUpdatedAt = lastBackendPersistedRecordRef.current?.updatedAt;
        if (timestampValue(remoteUpdatedAt) <= timestampValue(localUpdatedAt)) { return; }

        const remoteRecord = {
          ...remotePayload.record,
          listId: activeListId,
          serverBacked: true,
          updatedAt: remoteUpdatedAt,
        };
        lastLocalPersistedRecordRef.current = remoteRecord;
        lastBackendPersistedRecordRef.current = remoteRecord;
        pendingBackendSaveRecordRef.current = undefined;
        suppressNextAutosaveStatusRef.current = true;
        skipNextAutosaveRef.current = true;
        if (remoteSyncStatusTimerRef.current) {
          window.clearTimeout(remoteSyncStatusTimerRef.current);
        }
        setSaveStatus('syncing');
        localStorageRepository.save(remoteRecord);
        setStorageMode('backend');
        setIsServerBackedList(true);
        setCountryCode(remoteRecord.countryCode);
        setListName(remoteRecord.listName ?? '');
        setInput(remoteRecord.input);
        setItems(parseItems(
          remoteRecord.input,
          countryConfigForMeasurementDisplayMode(remoteRecord.countryCode, currentState.measurementDisplayMode),
          remoteRecord.items,
        ));
        setSharedListHistory(
          sharedListHistoryRepository.remember({
            listId: activeListId,
            listName: remoteRecord.listName,
            itemPreview: getSharedListPreview(remoteRecord.items),
            createdAt: remotePayload.createdAt,
            updatedAt: remoteUpdatedAt,
            viewedAt: new Date().toISOString(),
          }),
        );
        remoteSyncStatusTimerRef.current = window.setTimeout(() => {
          setSaveStatus('saved');
          remoteSyncStatusTimerRef.current = undefined;
        }, 300);
        verboseDebugLog('shared list remote update applied', { listId: activeListId, updatedAt: remoteUpdatedAt });
      } catch (error) {
        verboseDebugLog('shared list remote update check failed', { listId: activeListId, error });
      } finally {
        inFlight = false;
      }
    };

    const requestSync = () => {
      void syncRemoteRecord();
    };
    const requestVisibleSync = () => {
      if (document.visibilityState === 'visible') {
        void syncRemoteRecord();
      }
    };
    const eventSource =
      typeof EventSource === 'undefined'
        ? undefined
        : new EventSource(sharedShoppingListEventsUrl(activeListId));
    const intervalId = window.setInterval(() => {
      if (isSseOpen && Date.now() - lastFallbackPollAt < SHARED_LIST_SYNC_SSE_FALLBACK_POLL_MS) { return; }
      lastFallbackPollAt = Date.now();
      void syncRemoteRecord();
    }, SHARED_LIST_SYNC_POLL_MS);
    const handleRemoteListEvent = () => {
      void syncRemoteRecord();
    };
    const handleEventSourceOpen = () => {
      isSseOpen = true;
    };
    const handleEventSourceError = () => {
      isSseOpen = false;
    };

    void syncRemoteRecord();
    eventSource?.addEventListener('open', handleEventSourceOpen);
    eventSource?.addEventListener('error', handleEventSourceError);
    eventSource?.addEventListener('updated', handleRemoteListEvent);
    eventSource?.addEventListener('deleted', handleRemoteListEvent);
    window.addEventListener('focus', requestSync);
    window.addEventListener('online', requestSync);
    document.addEventListener('visibilitychange', requestVisibleSync);

    return () => {
      cancelled = true;
      eventSource?.close();
      window.clearInterval(intervalId);
      eventSource?.removeEventListener('open', handleEventSourceOpen);
      eventSource?.removeEventListener('error', handleEventSourceError);
      eventSource?.removeEventListener('updated', handleRemoteListEvent);
      eventSource?.removeEventListener('deleted', handleRemoteListEvent);
      window.removeEventListener('focus', requestSync);
      window.removeEventListener('online', requestSync);
      document.removeEventListener('visibilitychange', requestVisibleSync);
    };
  }, [
    activeListId,
    canUseBackend,
    isLoaded,
    isServerBackedList,
    storageMode,
    verboseDebugLog,
  ]);

  const handleCreateSharedLink = async () => {
    if (!canUseBackend) {
      setShareError('connectBackendFirst');
      verboseDebugLog('shared link create blocked', { forceLocalStorage: debugSettings.forceLocalStorage });
      return;
    }

    setIsCreatingShareLink(true);
    setShareError(undefined);

    try {
      const record = buildRecord(input, items, countryCode, activeListId, true, listName);
      await saveSharedShoppingList(activeListId, record);
      localStorageRepository.save(record);
      lastLocalPersistedRecordRef.current = record;
      lastBackendPersistedRecordRef.current = record;
      rememberSharedList({
        listId: activeListId,
        listName: record.listName,
        items: record.items,
        createdAt: record.updatedAt,
        updatedAt: record.updatedAt,
      });
      setStorageMode('backend');
      setIsServerBackedList(true);
      updateRoute({ page: 'edit', listId: activeListId });
      verboseDebugLog('shared link created', { listId: activeListId });
    } catch (error) {
      console.warn('Unable to create shared link.', error);
      setShareError('createFailed');
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleRefreshSharedList = async () => {
    if (!isServerBackedList) { return; }
    if (!canUseBackend) {
      setShareError('connectBackendFirst');
      verboseDebugLog('shared list refresh blocked', { listId: activeListId, forceLocalStorage: debugSettings.forceLocalStorage });
      return;
    }

    setIsRefreshingSharedList(true);
    setShareError(undefined);

    try {
      const remotePayload = await loadSharedShoppingList(activeListId);
      const record = { ...remotePayload.record, listId: activeListId, serverBacked: true };
      applyRecord(record);
      setStorageMode('backend');
      if (remotePayload.exists) {
        rememberSharedList({
          listId: activeListId,
          listName: record.listName,
          items: record.items,
          createdAt: remotePayload.createdAt,
          updatedAt: remotePayload.updatedAt ?? record.updatedAt,
        });
      }
      setShareError(remotePayload.exists ? undefined : 'refreshMissing');
    } catch (error) {
      console.warn('Unable to refresh shared list.', error);
      setShareError('refreshFailed');
    } finally {
      setIsRefreshingSharedList(false);
    }
  };

  const resetAll = () => {
    localStorageRepository.clear();
    if (isServerBackedList) {
      removeSharedListFromHistory(activeListId);
      void clearSharedShoppingList(activeListId).catch((error: unknown) => {
        console.warn('Unable to clear shared shopping list.', error);
      });
    }

    const initial = defaultRecord();
    lastLocalPersistedRecordRef.current = initial;
    lastBackendPersistedRecordRef.current = undefined;
    setActiveListId(initial.listId ?? createUuidV7());
    setIsServerBackedList(false);
    setStorageMode('local');
    setCountryCode(initial.countryCode);
    setListName(initial.listName ?? '');
    setInput(initial.input);
    setItems(parseItems(
      initial.input,
      countryConfigForMeasurementDisplayMode(initial.countryCode, measurementDisplayMode),
    ));
    setDraftItem('');
    setQuery('');
    updateRoute({ page: 'edit' });
  };

  const dismissPwaInstallNudge = () => {
    window.localStorage.setItem(PWA_INSTALL_NUDGE_DISMISSED_KEY, 'true');
    setIsPwaInstallNudgeVisible(false);
  };

  const promptPwaInstall = async () => {
    if (!beforeInstallPromptEvent) { return; }

    await beforeInstallPromptEvent.prompt();
    const choice = await beforeInstallPromptEvent.userChoice;
    setBeforeInstallPromptEvent(undefined);

    if (choice.outcome === 'accepted') {
      setIsPwaInstalled(true);
      setIsPwaInstallNudgeVisible(false);
      return;
    }

    dismissPwaInstallNudge();
  };
  const canPromptInstall = Boolean(beforeInstallPromptEvent);
  const canShowManualInstallGuidance =
    debugSettings.showPwaInstallPrompts || (hasInstallPromptCheckSettled && isLikelyMobileForInstall);
  const isFloatingPwaInstallVisible =
    isLoaded &&
    (isPwaInstallNudgeVisible || debugSettings.showPwaInstallPrompts) &&
    !isPwaInstalled &&
    (canPromptInstall || canShowManualInstallGuidance);

  useEffect(() => {
    if (!debugModeNotice) { return undefined; }

    const dismissTimer = window.setTimeout(() => {
      setDebugModeNotice((current) => current?.id === debugModeNotice.id ? undefined : current);
    }, DEBUG_MODE_NOTICE_DURATION_MS);

    return () => window.clearTimeout(dismissTimer);
  }, [debugModeNotice]);

  return (
    <I18nProvider value={{ locale, messages, setLocale }}>
      <PwaSplashScreen disabled={debugSettings.disablePwaSplash} />
      <div className={'shopping-app'}>
        <div className={'shopping-shell'}>
          <a className={'skip-link'} href={'#main-content'}>
            {messages.actions.skipToMainContent}
          </a>
          <AppHeader
            page={visiblePage}
            hasItems={items.length > 0}
            backendStatus={backendStatus}
            resolvedTheme={resolvedTheme}
            isDebugMode={isDebugMode}
            onChangePage={changePage}
            onRevealEasterEgg={() => {
              if (!debugSettings.disableEasterEggs) {
                setIsSecretAisleEasterEggVisible(true);
              }
            }}
          />

          <main id={'main-content'} className={'main-content'} tabIndex={-1}>
            {visiblePage === 'edit' ? (
              <EditPage
                input={input}
                listName={listName}
                draftItem={draftItem}
                total={total}
                checkedTotal={checkedTotal}
                progress={progress}
                countryCode={countryCode}
                saveStatus={saveStatus}
                onInputChange={setInput}
                onListNameChange={setListName}
                onDraftItemChange={setDraftItem}
                onCountryChange={handleCountryChange}
                onParse={handleParse}
                onSaveAndStay={handleSaveAndStay}
                onResetAll={resetAll}
                onAddSingleItem={handleAddSingleItem}
                onCreateSharedLink={handleCreateSharedLink}
                onRefreshSharedList={handleRefreshSharedList}
                canUseBackend={canUseBackend}
                canCreateSharedLink={canCreateSharedLink}
                resolvedTheme={resolvedTheme}
                shareLink={shareLink}
                isCreatingShareLink={isCreatingShareLink}
                isRefreshingSharedList={isRefreshingSharedList}
                isLoadingSharedList={isLoadingSharedList}
                shareError={shareErrorMessage}
                sharedListHistory={sharedListHistory}
                onLoadSharedInput={handleLoadSharedInput}
                onValidateSharedInput={validateSharedInput}
                onLoadSharedListFromHistory={loadSharedListById}
                onDeleteSharedListFromHistory={removeSharedListFromHistory}
              />
            ) : null}

            {visiblePage === 'route' ? (
              <RoutePage
                listName={listName}
                query={query}
                isFilterVisible={isRouteFilterVisible}
                saveStatus={saveStatus}
                grouped={grouped}
                hasItems={items.length > 0}
                viewMode={routeViewMode}
                measurementDisplayMode={measurementDisplayMode}
                onQueryChange={setQuery}
                onToggleFilter={toggleRouteFilter}
                onViewModeChange={setRouteViewMode}
                onMeasurementDisplayModeChange={handleMeasurementDisplayModeChange}
                onToggleSection={toggleSection}
                onToggleItem={toggleItem}
                onResetChecks={resetChecks}
                onOpenEdit={() => changePage('edit')}
              />
            ) : null}

            {visiblePage === 'settings' ? (
              <SettingsPage
                routeViewMode={routeViewMode}
                themeMode={themeMode}
                onRouteViewModeChange={setRouteViewMode}
                onThemeChange={setThemeMode}
                canPromptInstall={canPromptInstall}
                canShowManualInstallGuidance={canShowManualInstallGuidance}
                isInstalled={isPwaInstalled}
                isFloatingInstallVisible={isFloatingPwaInstallVisible}
                onInstall={promptPwaInstall}
                notificationsEnabled={notificationsEnabled}
                notificationPermission={notificationPermission}
                onNotificationsChange={handleNotificationsChange}
              />
            ) : null}

            {visiblePage === 'sections' ? <SectionsPage config={config} /> : null}

            {visiblePage === 'about' ? (
              <AboutPage
                isDebugMode={isDebugMode}
                isUpdateAvailable={Boolean(backendStatus.health.version && backendStatus.health.version !== appVersion)}
                onEnableDebugMode={enableDebugMode}
                onAlreadyDebugMode={showAlreadyDebugModeNotice}
                onRefreshUpdate={() => requestAppVersionReload(backendStatus.health.version, true)}
              />
            ) : null}

            {visiblePage === 'debug' ? (
              <DebugPage
                backendStatus={backendStatus}
                backendOperation={backendOperation}
                heartbeatSamples={backendHeartbeatSamples}
                storageMode={storageMode}
                notificationsEnabled={notificationsEnabled}
                notificationPermission={notificationPermission}
                debugNotificationResult={debugNotificationResult}
                currentSharedListDatabaseEntry={currentSharedListDatabaseEntry}
                items={items}
                config={config}
                matcherTests={matcherTests}
                configTests={configTests}
                countQuantityTests={countQuantityTests}
                measurementTests={measurementTests}
                unitQuantityTests={unitQuantityTests}
                variantTests={variantTests}
                storageTests={storageTests}
                stateTests={stateTests}
                isDebugMode={isDebugMode}
                activeTab={activeDebugTab}
                debugSettings={debugSettings}
                matcherHasFailures={matcherTests.some((test) => !test.passed)}
                configHasFailures={configTests.some((test) => !test.passed)}
                countQuantityHasFailures={countQuantityTests.some((test) => !test.passed)}
                measurementHasFailures={measurementTests.some((test) => !test.passed)}
                unitQuantityHasFailures={unitQuantityTests.some((test) => !test.passed)}
                variantHasFailures={variantTests.some((test) => !test.passed)}
                storageHasFailures={storageTests.some((test) => !test.passed)}
                stateHasFailures={stateTests.some((test) => !test.passed)}
                onRenameItem={handleRenameItem}
                onToggleItem={toggleItem}
                onDeleteItem={handleDeleteItem}
                onDebugModeChange={handleDebugModeChange}
                onDebugSettingChange={handleDebugSettingChange}
                onDebugNotificationTest={handleDebugNotificationTest}
                onDebugEventTest={handleDebugEventTest}
                onDebugTabChange={changeDebugTab}
                onBackToEdit={() => changePage('edit')}
                onBackToSettings={() => changePage('settings')}
              />
            ) : null}

            {visiblePage === 'not-found' || visiblePage === 'server-error' ? (
              <ErrorPage
                variant={visiblePage}
                isDebugMode={isDebugMode}
                onBackToEdit={() => changePage('edit')}
                onOpenDebug={() => changePage('debug')}
              />
            ) : null}
          </main>
        </div>
        <PwaInstallBadge
          canPromptInstall={canPromptInstall}
          isVisible={isFloatingPwaInstallVisible}
          onDismiss={dismissPwaInstallNudge}
          onInstall={promptPwaInstall}
        />
        {debugModeNotice ? (
          <ToastPopup key={debugModeNotice.id} {...debugModeNotice} />
        ) : null}
        <SecretAisleEasterEgg
          isVisible={isSecretAisleEasterEggVisible && !debugSettings.disableEasterEggs}
          onDismiss={() => setIsSecretAisleEasterEggVisible(false)}
        />
        {predatorEasterEggRun > 0 && !debugSettings.disableEasterEggs ? (
          <PredatorEasterEgg
            key={predatorEasterEggRun}
            onComplete={() => setPredatorEasterEggRun(0)}
          />
        ) : null}
      </div>
    </I18nProvider>
  );
}
