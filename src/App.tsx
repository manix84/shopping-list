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
import { chooseNewestRecord } from './lib/repository/recordMerge';
import { readRouteFromLocationParts, routeToUrl } from './lib/routing';
import { getSectionMeta } from './lib/sections';
import { cleanLine, stripDisplaySizeLabel } from './lib/stringUtils';
import { getResolvedTheme, loadThemeMode, saveThemeMode } from './lib/themePreference';
import { createUuidV7 } from './lib/uuid';
import { DebugPage } from './pages/DebugPage';
import { EditPage } from './pages/EditPage';
import { RoutePage } from './pages/RoutePage';
import { SectionsPage } from './pages/SectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AppRoute, BackendStatus, CountryCode, GroupedSectionView, Item, PageKey, SectionKey, ThemeMode } from './types';

const DEFAULT_PAGE: PageKey = 'edit';
type StorageMode = 'local' | 'backend';
type ShareErrorKey = 'connectBackendFirst' | 'createFailed' | 'refreshMissing' | 'refreshFailed' | 'offlineBackup';

const defaultBackendStatus = (): BackendStatus => ({
  state: 'checking',
  health: { ok: false },
  database: { ok: false },
});

const appBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

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
  const [draftItem, setDraftItem] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(() => defaultBackendStatus());
  const [activeListId, setActiveListId] = useState<string>(() => readRouteFromLocation().listId ?? createUuidV7());
  const [isServerBackedList, setIsServerBackedList] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('uk');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [locale, setLocale] = useState(() => loadLocale());
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const [isRefreshingSharedList, setIsRefreshingSharedList] = useState(false);
  const [shareError, setShareError] = useState<ShareErrorKey>();

  const config = useMemo(() => COUNTRY_CONFIGS[countryCode], [countryCode]);
  const messages = useMemo(() => createMessages(locale), [locale]);
  const { page, listId } = route;
  const canUseBackend = backendStatus.state === 'connected';
  const shareLink =
    typeof window === 'undefined' || !isServerBackedList
      ? undefined
      : `${window.location.origin}${appBasePath}/list/${activeListId}/edit`;
  const shareErrorMessage = shareError ? messages.sharing[shareError] : undefined;

  const changePage = (nextPage: PageKey) => {
    setRoute((current) => ({ ...current, page: nextPage }));
  };

  const applyTheme = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;

    const resolved = getResolvedTheme(mode);
    document.documentElement.dataset.theme = resolved;

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = resolved === 'dark' ? '#0b1220' : '#0f172a';
    }

    updateBrowserIcon(resolved);
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
      setItems(
        selectedRecord.items.length
          ? selectedRecord.items
          : parseItems(selectedRecord.input, COUNTRY_CONFIGS[selectedRecord.countryCode]),
      );
      setIsLoaded(true);
    };

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [listId]);

  useEffect(() => {
    if (!isLoaded) return;

    const interval = window.setInterval(() => {
      void checkBackendStatus().then(setBackendStatus);
    }, 30_000);

    return () => window.clearInterval(interval);
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
        setStorageMode('backend');
        setIsServerBackedList(true);
        setRoute((current) => ({
          page: current.page,
          listId: activeListId,
        }));
        setCountryCode(selectedRecord.countryCode);
        setInput(selectedRecord.input);
        setItems(
          selectedRecord.items.length
            ? selectedRecord.items
            : parseItems(selectedRecord.input, COUNTRY_CONFIGS[selectedRecord.countryCode]),
        );
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

      const nextStoredValue = [target.size, cleanedRaw, target.quantity].filter(Boolean).join(' ');
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

  const applyRecord = (record: ReturnType<typeof buildRecord>) => {
    if (record.listId) {
      setActiveListId(record.listId);
    }
    setIsServerBackedList(record.serverBacked === true);
    setCountryCode(record.countryCode);
    setInput(record.input);
    setItems(record.items.length ? record.items : parseItems(record.input, COUNTRY_CONFIGS[record.countryCode]));
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

    setIsRefreshingSharedList(true);
    setShareError(undefined);

    try {
      const remotePayload = await loadSharedShoppingList(activeListId);
      applyRecord({ ...remotePayload.record, listId: activeListId, serverBacked: true });
      setStorageMode('backend');
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
          <AppHeader page={page} hasItems={items.length > 0} backendStatus={backendStatus} onChangePage={changePage} />

          {page === 'edit' ? (
            <EditPage
              input={input}
              items={items}
              draftItem={draftItem}
              total={total}
              checkedTotal={checkedTotal}
              progress={progress}
              config={config}
              onInputChange={setInput}
              onDraftItemChange={setDraftItem}
              onParse={handleParse}
              onResetAll={resetAll}
              onAddSingleItem={handleAddSingleItem}
              onRenameItem={handleRenameItem}
              onToggleItem={toggleItem}
              onDeleteItem={handleDeleteItem}
              onCreateSharedLink={handleCreateSharedLink}
              onRefreshSharedList={handleRefreshSharedList}
              onOpenDebug={() => changePage('debug')}
              canUseBackend={canUseBackend}
              shareLink={shareLink}
              isCreatingShareLink={isCreatingShareLink}
              isRefreshingSharedList={isRefreshingSharedList}
              shareError={shareErrorMessage}
            />
          ) : null}

          {page === 'route' ? (
            <RoutePage
              query={query}
              grouped={grouped}
              hasItems={items.length > 0}
              onQueryChange={setQuery}
              onResetChecks={resetChecks}
              onResort={handleParse}
              onToggleSection={toggleSection}
              onToggleItem={toggleItem}
              onOpenEdit={() => changePage('edit')}
            />
          ) : null}

          {page === 'settings' ? (
            <SettingsPage
              countryCode={countryCode}
              themeMode={themeMode}
              onCountryChange={handleCountryChange}
              onThemeChange={setThemeMode}
              onOpenDebug={() => changePage('debug')}
            />
          ) : null}

          {page === 'sections' ? <SectionsPage config={config} /> : null}

          {page === 'debug' ? (
            <DebugPage
              backendStatus={backendStatus}
              matcherTests={matcherTests}
              quantityTests={quantityTests}
              storageTests={storageTests}
              matcherHasFailures={matcherTests.some((test) => !test.passed)}
              quantityHasFailures={quantityTests.some((test) => !test.passed)}
              storageHasFailures={storageTests.some((test) => !test.passed)}
              onBackToEdit={() => changePage('edit')}
              onBackToSettings={() => changePage('settings')}
            />
          ) : null}
        </div>
      </div>
    </I18nProvider>
  );
}
