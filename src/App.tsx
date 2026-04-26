import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_CONFIGS } from './config/countries';
import { AppHeader } from './components/AppHeader';
import { runMatcherTests, runQuantityTests, runStorageTests } from './lib/debugTests';
import {
  applyDocumentLocale,
  createMessages,
  I18nProvider,
  loadLocale,
  saveLocale,
} from './lib/i18n';
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
import { DebugPage } from './pages/DebugPage';
import { EditPage } from './pages/EditPage';
import { RoutePage } from './pages/RoutePage';
import { SectionsPage } from './pages/SectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AppRoute, BackendStatus, CountryCode, GroupedSectionView, Item, PageKey, RouteViewMode, SectionKey, SharedListHistoryEntry, ThemeMode } from './types';

const DEFAULT_PAGE: PageKey = 'edit';
const BACKEND_HEARTBEAT_CONNECTED_MS = 5_000;
const BACKEND_HEARTBEAT_RETRY_MS = 1_500;
type StorageMode = 'local' | 'backend';
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

const updateBrowserIcon = (theme: 'light' | 'dark'): void => {
  if (typeof document === 'undefined') return;

  const iconLink = document.querySelector<HTMLLinkElement>('#browser-theme-icon');
  const nextIcon = theme === 'dark' ? iconLink?.dataset.darkHref : iconLink?.dataset.lightHref;
  if (iconLink && nextIcon) {
    iconLink.href = nextIcon;
  }
};

const readRouteFromLocation = (): AppRoute => {
  if (typeof window === 'undefined') return { page: DEFAULT_PAGE };

  return readRouteFromLocationParts({
    pathname: window.location.pathname,
    hash: window.location.hash,
    basePath: appBasePath,
  });
};

const syncRouteToUrl = ({ page, listId }: AppRoute): void => {
  if (typeof window === 'undefined') return;

  const nextUrl = routeToUrl({ page, listId }, appBasePath);
  const currentUrl = `${window.location.pathname}${window.location.hash}`;
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
) => ({
  listId,
  serverBacked,
  input,
  items,
  updatedAt: new Date().toISOString(),
  countryCode,
});

const getSharedListPreview = (items: Item[]): string[] => items.slice(0, 6).map((item) => item.raw);

function updateItemTextInInput(input: string, previousDisplay: string, nextDisplay: string): string {
  const lines = input.split('\n');
  const index = lines.findIndex((line) => cleanLine(line) === cleanLine(previousDisplay));
  if (index === -1) return input;
  const next = [...lines];
  next[index] = nextDisplay;
  return next.join('\n');
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => readRouteFromLocation());
  const [input, setInput] = useState('');
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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [routeViewMode, setRouteViewMode] = useState<RouteViewMode>(() => loadRouteViewMode());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getResolvedTheme(loadThemeMode()));
  const [locale, setLocale] = useState(() => loadLocale());
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [isRefreshingSharedList, setIsRefreshingSharedList] = useState(false);
  const [isLoadingSharedList, setIsLoadingSharedList] = useState(false);
  const [shareError, setShareError] = useState<ShareErrorKey>();
  const [sharedListHistory, setSharedListHistory] = useState<SharedListHistoryEntry[]>(() => sharedListHistoryRepository.load());

  const config = useMemo(() => COUNTRY_CONFIGS[countryCode], [countryCode]);
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
    if (typeof document === 'undefined') return;

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
    items,
    createdAt,
    updatedAt,
  }: {
    listId: string;
    items: Item[];
    createdAt?: string;
    updatedAt: string;
  }) => {
    setSharedListHistory(
      sharedListHistoryRepository.remember({
        listId,
        itemPreview: getSharedListPreview(items),
        createdAt,
        updatedAt,
        viewedAt: new Date().toISOString(),
      }),
    );
  };

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

      if (cancelled) return;

      setStorageMode(nextStorageMode);
      setActiveListId(nextListId);
      setIsServerBackedList(nextServerBacked);
      setRoute((current) => ({
        page: current.page,
        listId: nextServerBacked ? nextListId : undefined,
      }));
      setCountryCode(selectedRecord.countryCode);
      setInput(selectedRecord.input);
      setItems(parseItems(selectedRecord.input, COUNTRY_CONFIGS[selectedRecord.countryCode], selectedRecord.items));
      setIsLoaded(true);
    };

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [listId]);

  useEffect(() => {
    if (!isLoaded) return;

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
      if (cancelled) return;

      if (inFlight) {
        pendingCheck = true;
        return;
      }

      inFlight = true;

      try {
        const nextBackendStatus = await checkBackendStatus();
        if (cancelled) return;

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
    if (!isLoaded || storageMode === 'backend' || backendStatus.state !== 'connected') return;

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
            items: selectedRecord.items,
            createdAt: remotePayload.createdAt,
            updatedAt: remotePayload.updatedAt ?? selectedRecord.updatedAt,
          });
        }
        setStorageMode('backend');
        setIsServerBackedList(true);
        setRoute((current) => ({
          page: current.page,
          listId: activeListId,
        }));
        setCountryCode(selectedRecord.countryCode);
        setInput(selectedRecord.input);
        setItems(parseItems(selectedRecord.input, COUNTRY_CONFIGS[selectedRecord.countryCode], selectedRecord.items));
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
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
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
    if (!isLoaded) return;
    const record = buildRecord(input, items, countryCode, activeListId, isServerBackedList);

    localStorageRepository.save(record);

    if (storageMode === 'backend' && backendStatus.state === 'connected') {
      const backendRecord = { ...record, serverBacked: true };
      void saveSharedShoppingList(activeListId, backendRecord).catch((error: unknown) => {
        console.warn('Unable to save shared shopping list to backend.', error);
      });
    }
  }, [activeListId, backendStatus.state, countryCode, input, isLoaded, isServerBackedList, items, storageMode]);

  useEffect(() => {
    syncRouteToUrl(route);
  }, [route]);

  useEffect(() => {
    if (isLoaded && page === 'route' && items.length === 0) {
      setRoute((current) => ({ ...current, page: 'edit' }));
    }
  }, [isLoaded, items.length, page]);

  const matcherTests = useMemo(() => runMatcherTests(config), [config]);
  const quantityTests = useMemo(() => runQuantityTests(), []);
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

  const handleParse = () => {
    setItems((current) => parseItems(input, config, current));
    setQuery('');
    setIsRouteFilterVisible(false);
    changePage('route');
  };

  const handleAddSingleItem = () => {
    const cleaned = cleanLine(draftItem);
    if (!cleaned) return;

    const nextInput = input.trim() ? `${input.trim()}\n${cleaned}` : cleaned;
    setInput(nextInput);
    setItems((current) => parseItems(nextInput, config, current));
    setDraftItem('');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) return current;

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
    if (!cleanedRaw) return;

    setItems((current) => {
      const target = current.find((item) => item.id === itemId);
      if (!target) return current;

      const nextStoredValue = [
        target.size,
        typeof target.quantityValue === 'number' ? formatCountQuantity(target.quantityValue) : undefined,
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
    setItems((current) => parseItems(input, COUNTRY_CONFIGS[nextCountryCode], current));
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

  const applyRecord = (record: ReturnType<typeof buildRecord>) => {
    if (record.listId) {
      setActiveListId(record.listId);
    }
    setIsServerBackedList(record.serverBacked === true);
    setCountryCode(record.countryCode);
    setInput(record.input);
    setItems(parseItems(record.input, COUNTRY_CONFIGS[record.countryCode], record.items));
  };

  const handleCreateSharedLink = async () => {
    if (backendStatus.state !== 'connected') {
      setShareError('connectBackendFirst');
      return;
    }

    setIsCreatingShareLink(true);
    setShareError(undefined);

    try {
      const record = buildRecord(input, items, countryCode, activeListId, true);
      await saveSharedShoppingList(activeListId, record);
      localStorageRepository.save(record);
      rememberSharedList({
        listId: activeListId,
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
    if (!isServerBackedList) return;
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
    setInput(initial.input);
    setItems(parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]));
    setDraftItem('');
    setQuery('');
    setRoute({ page: 'edit' });
  };

  return (
    <I18nProvider value={{ locale, messages, setLocale }}>
      <div className="shopping-app">
        <div className="shopping-shell">
          <AppHeader
            page={page}
            hasItems={items.length > 0}
            backendStatus={backendStatus}
            resolvedTheme={resolvedTheme}
            onChangePage={changePage}
          />

          {page === 'edit' ? (
            <EditPage
              input={input}
              draftItem={draftItem}
              total={total}
              checkedTotal={checkedTotal}
              progress={progress}
              countryCode={countryCode}
              onInputChange={setInput}
              onDraftItemChange={setDraftItem}
              onCountryChange={handleCountryChange}
              onParse={handleParse}
              onResetAll={resetAll}
              onResetChecks={resetChecks}
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
              query={query}
              isFilterVisible={isRouteFilterVisible}
              grouped={grouped}
              hasItems={items.length > 0}
              viewMode={routeViewMode}
              onQueryChange={setQuery}
              onToggleFilter={toggleRouteFilter}
              onViewModeChange={setRouteViewMode}
              onToggleSection={toggleSection}
              onToggleItem={toggleItem}
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
            />
          ) : null}

          {page === 'sections' ? <SectionsPage config={config} /> : null}

          {page === 'debug' ? (
            <DebugPage
              backendStatus={backendStatus}
              items={items}
              config={config}
              matcherTests={matcherTests}
              quantityTests={quantityTests}
              storageTests={storageTests}
              matcherHasFailures={matcherTests.some((test) => !test.passed)}
              quantityHasFailures={quantityTests.some((test) => !test.passed)}
              storageHasFailures={storageTests.some((test) => !test.passed)}
              onRenameItem={handleRenameItem}
              onToggleItem={toggleItem}
              onDeleteItem={handleDeleteItem}
              onBackToEdit={() => changePage('edit')}
              onBackToSettings={() => changePage('settings')}
            />
          ) : null}
        </div>
      </div>
    </I18nProvider>
  );
}
