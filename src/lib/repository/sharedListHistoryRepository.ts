import type { SharedListHistoryEntry } from '../../types';

export const STORAGE_KEY = 'smart-shopping-list-shared-history-v1';
const MAX_ENTRIES = 12;
const MAX_PREVIEW_ITEMS = 6;

const isHistoryEntry = (value: unknown): value is SharedListHistoryEntry =>
  Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as SharedListHistoryEntry).listId === 'string' &&
      Array.isArray((value as SharedListHistoryEntry).itemPreview) &&
      typeof (value as SharedListHistoryEntry).updatedAt === 'string' &&
      typeof (value as SharedListHistoryEntry).viewedAt === 'string',
  );

const sanitizeEntries = (value: unknown): SharedListHistoryEntry[] => {
  if (!Array.isArray(value)) { return []; }

  return value
    .filter(isHistoryEntry)
    .map((entry) => ({
      listId: entry.listId,
      listName: typeof entry.listName === 'string' && entry.listName.trim() ? entry.listName.trim() : undefined,
      itemPreview: entry.itemPreview.filter((item) => typeof item === 'string').slice(0, MAX_PREVIEW_ITEMS),
      createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : undefined,
      updatedAt: entry.updatedAt,
      viewedAt: entry.viewedAt,
    }))
    .sort((a, b) => Date.parse(b.viewedAt) - Date.parse(a.viewedAt))
    .slice(0, MAX_ENTRIES);
};

export const sharedListHistoryRepository = {
  load(): SharedListHistoryEntry[] {
    if (typeof window === 'undefined') { return []; }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? sanitizeEntries(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  },
  save(entries: SharedListHistoryEntry[]): void {
    if (typeof window === 'undefined') { return; }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeEntries(entries)));
  },
  remember(entry: SharedListHistoryEntry): SharedListHistoryEntry[] {
    const loaded = this.load();
    const existing = loaded.find((current) => current.listId === entry.listId);
    const current = loaded.filter((currentEntry) => currentEntry.listId !== entry.listId);
    const next = [
      {
        ...entry,
        createdAt: entry.createdAt ?? existing?.createdAt,
        listName: entry.listName?.trim() || undefined,
        itemPreview: entry.itemPreview.slice(0, MAX_PREVIEW_ITEMS),
      },
      ...current,
    ].slice(0, MAX_ENTRIES);
    this.save(next);
    return next;
  },
  remove(listId: string): SharedListHistoryEntry[] {
    const next = this.load().filter((entry) => entry.listId !== listId);
    this.save(next);
    return next;
  },
} as const;
