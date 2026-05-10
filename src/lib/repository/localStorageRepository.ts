import { COUNTRY_CONFIGS } from '../../config/countries';
import type { ShoppingListRecord } from '../../types';
import { defaultCountryCode } from '../defaultCountryPreference';
import { parseItems } from '../parser';
import { hasLocalStorageValue, readLocalStorageValue } from '../storageKeys';
import { createUuidV7 } from '../uuid';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './recordCodec';
import type { ShoppingListRepository } from './storage';

export const STORAGE_KEY = 'shoppingList:record';
const LEGACY_STORAGE_KEYS = ['smart-shopping-list-v1'] as const;

export const defaultRecord = (): ShoppingListRecord => ({
  listId: createUuidV7(),
  serverBacked: false,
  input: '',
  items: [],
  updatedAt: new Date().toISOString(),
  countryCode: defaultCountryCode(),
});

export const localStorageRepository = {
  load: () => {
    if (typeof window === 'undefined') { return defaultRecord(); }

    const raw = readLocalStorageValue(STORAGE_KEY, LEGACY_STORAGE_KEYS);
    if (!raw) {
      const initial = defaultRecord();
      initial.items = parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]);
      return initial;
    }

    const decoded = decodeShoppingListRecord(raw);
    if (!decoded) {
      const initial = defaultRecord();
      initial.items = parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]);
      return initial;
    }

    return decoded;
  },
  save: (record) => {
    if (typeof window === 'undefined') { return; }
    window.localStorage.setItem(STORAGE_KEY, encodeShoppingListRecord(record));
  },
  clear: () => {
    if (typeof window === 'undefined') { return; }
    window.localStorage.removeItem(STORAGE_KEY);
  },
} satisfies ShoppingListRepository;

export const hasStoredShoppingListRecord = (): boolean => {
  if (typeof window === 'undefined') { return false; }
  return hasLocalStorageValue(STORAGE_KEY, LEGACY_STORAGE_KEYS);
};
