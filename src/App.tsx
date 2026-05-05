import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRY_CONFIGS } from './config/countries';
import { AppHeader } from './components/AppHeader';
import { PredatorEasterEgg } from './components/PredatorEasterEgg';
import { PwaInstallBadge } from './components/PwaInstallBadge';
import { PwaSplashScreen } from './components/PwaSplashScreen';
import { SecretAisleEasterEgg } from './components/SecretAisleEasterEgg';
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
import { getDisplayValue, getStoredValue, parseItems } from './lib/parser';
import {
  checkBackendStatus,
  clearSharedShoppingList,
  loadSharedShoppingList,
  saveSharedShoppingList,
} from './lib/repository/apiRepository';
import {
  defaultRecord,
  hasStoredShoppingListRecord,
  localStorageRepository,
} from './lib/repository/localStorageRepository';
import { sharedListHistoryRepository } from './lib/repository/sharedListHistoryRepository';
import { chooseNewestRecord } from './lib/repository/recordMerge';
import { readRouteFromLocationParts, routeToUrl } from './lib/routing';
import { getSectionMeta } from './lib/sections';
import { extractSharedListId } from './lib/sharedLinks';
import { cleanLine, stripDisplaySizeLabel } from './lib/stringUtils';
import { loadRouteViewMode, saveRouteViewMode } from './lib/routeViewPreference';
import { getResolvedTheme, loadThemeMode, saveThemeMode } from './lib/themePreference';
import { createUuidV7 } from './lib/uuid';
import { formatCountQuantity } from './lib/quantity';
import { extractVariant } from './lib/variant';
import { AboutPage } from './pages/AboutPage';
import { DebugPage } from './pages/DebugPage';
import { EditPage } from './pages/EditPage';
import { ErrorPage } from './pages/ErrorPage';
import { RoutePage } from './pages/RoutePage';
import { SectionsPage } from './pages/SectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AppRoute, BackendStatus, CountryCode, GroupedSectionView, Item, MeasurementDisplayMode, PageKey, RouteViewMode, SaveStatus, SectionKey, SharedListHistoryEntry, ShoppingListRecord, ThemeMode } from './types';

const DEFAULT_PAGE: PageKey = 'edit';
const BACKEND_HEARTBEAT_CONNECTED_MS = 5_000;
const BACKEND_HEARTBEAT_RETRY_MS = 1_500;
const PWA_INSTALL_NUDGE_DISMISSED_KEY = 'smart-shopping-list-pwa-install-nudge-dismissed-v1';
const PWA_INSTALL_PROMPT_SETTLE_MS = 1_200;
const KONAMI_SEQUENCE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'] as const;
const KONAMI_TOUCH_SWIPE_MIN_PX = 42;
const KONAMI_TOUCH_TAP_MAX_PX = 14;
const KONAMI_TOUCH_TAP_MAX_MS = 260;
const KONAMI_TOUCH_LOCK_START_INDEX = 2;
const KONAMI_TOUCH_SEQUENCE_TIMEOUT_MS = 1_600;
type StorageMode = 'local' | 'backend';
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

const defaultBackendStatus = (): BackendStatus => ({
  state: 'checking',
  health: { ok: false },
  database: { ok: false },
});

const appBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
const currentOrigin = (): string | undefined => (typeof window === 'undefined' ? undefined : window.location.origin);

const isRunningInstalledPwa = (): boolean => {
  if (typeof window === 'undefined') { return false; }

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
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

const syncRouteToUrl = ({ page, listId }: AppRoute): void => {
  if (typeof window === 'undefined') { return; }

  const nextUrl = routeToUrl({ page, listId }, appBasePath);
  const currentUrl = window.location.pathname;
  if (currentUrl !== nextUrl) {
    window.history.replaceState(null, '', nextUrl);
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
  const saveRequestIdRef = useRef(0);
  const suppressNextAutosaveStatusRef = useRef(true);
  const suppressNextAutosaveStatus = () => {
    suppressNextAutosaveStatusRef.current = true;
    setSaveStatus('idle');
  };

  const config = useMemo(
    () => withMeasurementDisplayMode(COUNTRY_CONFIGS[countryCode], measurementDisplayMode),
    [countryCode, measurementDisplayMode],
  );
  const messages = useMemo(() => createMessages(locale), [locale]);
  const { page, listId } = route;
  const canUseBackend = backendStatus.state === 'connected';
  const canCreateSharedLink = items.length > 0 || cleanLine(input).length > 0;
  const shareLink =
    typeof window === 'undefined' || !canUseBackend || !isServerBackedList
      ? undefined
      : `${window.location.origin}${appBasePath}/list/${activeListId}/edit`;
  const shareErrorMessage = shareError ? messages.sharing[shareError] : undefined;

  const changePage = (nextPage: PageKey) => {
    setRoute((current) => ({ ...current, page: nextPage }));
  };

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
  }, []);

  const removeSharedListFromHistory = (nextListId: string) => {
    setSharedListHistory(sharedListHistoryRepository.remove(nextListId));
  };

  const loadSharedListById = async (nextListId: string): Promise<boolean> => {
    if (backendStatus.state !== 'connected') {
      setShareError('connectBackendFirst');
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
      rememberSharedList({
        listId: nextListId,
        listName: record.listName,
        items: record.items,
        createdAt: remotePayload.createdAt,
        updatedAt: remotePayload.updatedAt ?? record.updatedAt,
      });
      setStorageMode('backend');
      setIsServerBackedList(true);
      setRoute({ page: 'edit', listId: nextListId });
      setShareError(undefined);
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
    if (backendStatus.state !== 'connected') {
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
      const localRecord = localStorageRepository.load();
      const hasLocalRecord = hasStoredShoppingListRecord();
      const nextListId = listId ?? localRecord.listId ?? createUuidV7();
      const localRecordWithIdentity = {
        ...localRecord,
        listId: nextListId,
        serverBacked: localRecord.serverBacked === true || Boolean(listId),
      };
      let selectedRecord = localRecordWithIdentity;
      let nextStorageMode: StorageMode = 'local';
      let nextServerBacked = localRecordWithIdentity.serverBacked === true;

      const initialBackendStatus = await checkBackendStatus();
      if (!cancelled) {
        setBackendStatus(initialBackendStatus);
      }

      if (initialBackendStatus.state !== 'connected' && nextServerBacked) {
        setShareError('offlineBackup');
      }

      if (initialBackendStatus.state === 'connected') {
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
        } catch (error) {
          console.warn('Backend was detected but could not be loaded. Falling back to local storage.', error);
          if (!cancelled) {
            setBackendStatus({
              ...initialBackendStatus,
              state: 'error',
            });
          }
        }
      }

      if (cancelled) { return; }

      setStorageMode(nextStorageMode);
      setActiveListId(nextListId);
      setIsServerBackedList(nextServerBacked);
      setRoute((current) => ({
        page: current.page,
        listId: nextServerBacked ? nextListId : undefined,
      }));
      setCountryCode(selectedRecord.countryCode);
      setListName(selectedRecord.listName ?? '');
      setInput(selectedRecord.input);
      setItems(parseItems(
        selectedRecord.input,
        countryConfigForMeasurementDisplayMode(selectedRecord.countryCode, measurementDisplayMode),
        selectedRecord.items,
      ));
      setIsLoaded(true);
    };

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [listId]);

  useEffect(() => {
    if (!isLoaded) { return; }

    let cancelled = false;
    let inFlight = false;
    let timeoutId: number | undefined;
    let pendingCheck = false;

    const scheduleHeartbeat = (delay: number) => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        void runHeartbeat();
      }, delay);
    };

    const runHeartbeat = async () => {
      if (cancelled) { return; }

      if (inFlight) {
        pendingCheck = true;
        return;
      }

      inFlight = true;

      try {
        const nextBackendStatus = await checkBackendStatus();
        if (cancelled) { return; }

        setBackendStatus(nextBackendStatus);
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
      scheduleHeartbeat(0);
    };

    const requestVisibleHeartbeat = () => {
      if (document.visibilityState === 'visible') {
        requestImmediateHeartbeat();
      }
    };

    scheduleHeartbeat(BACKEND_HEARTBEAT_CONNECTED_MS);
    window.addEventListener('focus', requestImmediateHeartbeat);
    window.addEventListener('online', requestImmediateHeartbeat);
    window.addEventListener('offline', requestImmediateHeartbeat);
    document.addEventListener('visibilitychange', requestVisibleHeartbeat);

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener('focus', requestImmediateHeartbeat);
      window.removeEventListener('online', requestImmediateHeartbeat);
      window.removeEventListener('offline', requestImmediateHeartbeat);
      document.removeEventListener('visibilitychange', requestVisibleHeartbeat);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || storageMode === 'backend' || backendStatus.state !== 'connected') { return; }

    const connectBackend = async () => {
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
        setRoute((current) => ({
          page: current.page,
          listId: activeListId,
        }));
        setCountryCode(selectedRecord.countryCode);
        setListName(selectedRecord.listName ?? '');
        setInput(selectedRecord.input);
        setItems(parseItems(
          selectedRecord.input,
          countryConfigForMeasurementDisplayMode(selectedRecord.countryCode, measurementDisplayMode),
          selectedRecord.items,
        ));
      } catch (error) {
        console.warn('Backend reconnected but could not be merged. Staying in local storage mode.', error);
        setBackendStatus((current) => ({
          ...current,
          state: 'error',
        }));
      }
    };

    void connectBackend();
  }, [activeListId, backendStatus.state, isLoaded, storageMode]);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute((current) => {
        const next = readRouteFromLocation();
        return current.page === next.page && current.listId === next.listId ? current : next;
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
      document.title = messages.app.title;
    }
  }, [locale, messages]);

  useEffect(() => {
    saveRouteViewMode(routeViewMode);
  }, [routeViewMode]);

  useEffect(() => {
    saveMeasurementDisplayMode(measurementDisplayMode);
  }, [measurementDisplayMode]);

  useEffect(() => {
    if (!isLoaded) { return; }
    const saveRequestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = saveRequestId;
    const shouldReportSaveStatus = !suppressNextAutosaveStatusRef.current;
    suppressNextAutosaveStatusRef.current = false;
    if (shouldReportSaveStatus) {
      setSaveStatus('saving');
    }

    const record = buildRecord(input, items, countryCode, activeListId, isServerBackedList, listName);

    try {
      localStorageRepository.save(record);
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

    if (storageMode === 'backend' && backendStatus.state === 'connected') {
      const backendRecord = { ...record, serverBacked: true };
      void saveSharedShoppingList(activeListId, backendRecord)
        .then(() => {
          if (shouldReportSaveStatus && saveRequestIdRef.current === saveRequestId) {
            setSaveStatus('saved');
          }
        })
        .catch((error: unknown) => {
          console.warn('Unable to save shared shopping list to backend.', error);
          if (shouldReportSaveStatus && saveRequestIdRef.current === saveRequestId) {
            setSaveStatus('error');
          }
        });
      return;
    }

    if (shouldReportSaveStatus) {
      setSaveStatus('saved');
    }
  }, [activeListId, backendStatus.state, countryCode, input, isLoaded, isServerBackedList, items, listName, storageMode]);

  useEffect(() => {
    syncRouteToUrl(route);
  }, [route]);

  useEffect(() => {
    if (isLoaded && page === 'route' && items.length === 0) {
      setRoute((current) => ({ ...current, page: 'edit' }));
    }
  }, [isLoaded, items.length, page]);

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

  const handleCreateSharedLink = async () => {
    if (backendStatus.state !== 'connected') {
      setShareError('connectBackendFirst');
      return;
    }

    setIsCreatingShareLink(true);
    setShareError(undefined);

    try {
      const record = buildRecord(input, items, countryCode, activeListId, true, listName);
      await saveSharedShoppingList(activeListId, record);
      localStorageRepository.save(record);
      rememberSharedList({
        listId: activeListId,
        listName: record.listName,
        items: record.items,
        createdAt: record.updatedAt,
        updatedAt: record.updatedAt,
      });
      setStorageMode('backend');
      setIsServerBackedList(true);
      setRoute({ page: 'edit', listId: activeListId });
    } catch (error) {
      console.warn('Unable to create shared link.', error);
      setShareError('createFailed');
    } finally {
      setIsCreatingShareLink(false);
    }
  };

  const handleRefreshSharedList = async () => {
    if (!isServerBackedList) { return; }
    if (backendStatus.state !== 'connected') {
      setShareError('connectBackendFirst');
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
    setRoute({ page: 'edit' });
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
  const canShowManualInstallGuidance = hasInstallPromptCheckSettled && isLikelyMobileForInstall;
  const isFloatingPwaInstallVisible =
    isLoaded &&
    isPwaInstallNudgeVisible &&
    !isPwaInstalled &&
    (canPromptInstall || canShowManualInstallGuidance);

  return (
    <I18nProvider value={{ locale, messages, setLocale }}>
      <PwaSplashScreen />
      <div className={'shopping-app'}>
        <div className={'shopping-shell'}>
          <a className={'skip-link'} href={'#main-content'}>
            {messages.actions.skipToMainContent}
          </a>
          <AppHeader
            page={page}
            hasItems={items.length > 0}
            backendStatus={backendStatus}
            resolvedTheme={resolvedTheme}
            onChangePage={changePage}
            onRevealEasterEgg={() => setIsSecretAisleEasterEggVisible(true)}
          />

          <main id={'main-content'} className={'main-content'} tabIndex={-1}>
            {page === 'edit' ? (
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

            {page === 'route' ? (
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

            {page === 'settings' ? (
              <SettingsPage
                routeViewMode={routeViewMode}
                themeMode={themeMode}
                onRouteViewModeChange={setRouteViewMode}
                onThemeChange={setThemeMode}
                onOpenDebug={() => changePage('debug')}
                canPromptInstall={canPromptInstall}
                canShowManualInstallGuidance={canShowManualInstallGuidance}
                isInstalled={isPwaInstalled}
                isFloatingInstallVisible={isFloatingPwaInstallVisible}
                onInstall={promptPwaInstall}
              />
            ) : null}

            {page === 'sections' ? <SectionsPage config={config} /> : null}

            {page === 'about' ? <AboutPage /> : null}

            {page === 'debug' ? (
              <DebugPage
                backendStatus={backendStatus}
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
                onBackToEdit={() => changePage('edit')}
                onBackToSettings={() => changePage('settings')}
              />
            ) : null}

            {page === 'not-found' || page === 'server-error' ? (
              <ErrorPage
                variant={page}
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
        <SecretAisleEasterEgg
          isVisible={isSecretAisleEasterEggVisible}
          onDismiss={() => setIsSecretAisleEasterEggVisible(false)}
        />
        {predatorEasterEggRun > 0 ? (
          <PredatorEasterEgg
            key={predatorEasterEggRun}
            onComplete={() => setPredatorEasterEggRun(0)}
          />
        ) : null}
      </div>
    </I18nProvider>
  );
}
