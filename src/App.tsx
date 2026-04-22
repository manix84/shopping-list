import { useEffect, useMemo, useState } from 'react';
import { COUNTRY_CONFIGS } from './config/countries';
import { AppHeader } from './components/AppHeader';
import { runMatcherTests, runQuantityTests } from './lib/debugTests';
import { getDisplayValue, getStoredValue, parseItems } from './lib/parser';
import { EXAMPLE_INPUT, defaultRecord, localStorageRepository } from './lib/repository/localStorageRepository';
import { getSectionMeta } from './lib/sections';
import { cleanLine, stripDisplaySizeLabel } from './lib/stringUtils';
import { DebugPage } from './pages/DebugPage';
import { EditPage } from './pages/EditPage';
import { RoutePage } from './pages/RoutePage';
import { SettingsPage } from './pages/SettingsPage';
import type { CountryCode, GroupedSectionView, Item, PageKey, SectionKey } from './types';

const APP_PAGES: PageKey[] = ['edit', 'route', 'settings', 'debug'];
const DEFAULT_PAGE: PageKey = 'edit';

const readPageFromHash = (): PageKey => {
  if (typeof window === 'undefined') return DEFAULT_PAGE;

  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return APP_PAGES.includes(raw as PageKey) ? (raw as PageKey) : DEFAULT_PAGE;
};

const syncPageToHash = (page: PageKey): void => {
  if (typeof window === 'undefined') return;

  const nextHash = `#/${page}`;
  if (window.location.hash !== nextHash) {
    window.history.replaceState(null, '', nextHash);
  }
};

function updateItemTextInInput(input: string, previousDisplay: string, nextDisplay: string): string {
  const lines = input.split('\n');
  const index = lines.findIndex((line) => cleanLine(line) === cleanLine(previousDisplay));
  if (index === -1) return input;
  const next = [...lines];
  next[index] = nextDisplay;
  return next.join('\n');
}

export default function App() {
  const [page, setPage] = useState<PageKey>(() => readPageFromHash());
  const [input, setInput] = useState(EXAMPLE_INPUT);
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [draftItem, setDraftItem] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('uk');

  const config = useMemo(() => COUNTRY_CONFIGS[countryCode], [countryCode]);

  useEffect(() => {
    const record = localStorageRepository.load();
    setCountryCode(record.countryCode);
    setInput(record.input);
    setItems(record.items.length ? record.items : parseItems(record.input, COUNTRY_CONFIGS[record.countryCode]));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setPage((current) => {
        const next = readPageFromHash();
        return current === next ? current : next;
      });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorageRepository.save({
      input,
      items,
      updatedAt: new Date().toISOString(),
      countryCode,
    });
  }, [countryCode, input, isLoaded, items]);

  useEffect(() => {
    syncPageToHash(page);
  }, [page]);

  const matcherTests = useMemo(() => runMatcherTests(config), [config]);
  const quantityTests = useMemo(() => runQuantityTests(), []);

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
    setPage('route');
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

  const resetAll = () => {
    localStorageRepository.clear();
    const initial = defaultRecord();
    setCountryCode(initial.countryCode);
    setInput(initial.input);
    setItems(parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]));
    setDraftItem('');
    setQuery('');
    setPage('edit');
  };

  return (
    <div className="shopping-app">
      <div className="shopping-shell">
        <AppHeader page={page} onChangePage={setPage} />

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
            onExample={() => setInput(EXAMPLE_INPUT)}
            onResetAll={resetAll}
            onAddSingleItem={handleAddSingleItem}
            onRenameItem={handleRenameItem}
            onToggleItem={toggleItem}
            onDeleteItem={handleDeleteItem}
            onOpenDebug={() => setPage('debug')}
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
            onOpenEdit={() => setPage('edit')}
          />
        ) : null}

        {page === 'settings' ? (
          <SettingsPage
            countryCode={countryCode}
            config={config}
            onCountryChange={handleCountryChange}
            onOpenDebug={() => setPage('debug')}
          />
        ) : null}

        {page === 'debug' ? (
          <DebugPage
            matcherTests={matcherTests}
            quantityTests={quantityTests}
            matcherHasFailures={matcherTests.some((test) => !test.passed)}
            quantityHasFailures={quantityTests.some((test) => !test.passed)}
            onBackToEdit={() => setPage('edit')}
            onBackToSettings={() => setPage('settings')}
          />
        ) : null}
      </div>
    </div>
  );
}
