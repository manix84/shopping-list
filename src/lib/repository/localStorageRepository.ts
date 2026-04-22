import { COUNTRY_CONFIGS } from '../../config/countries';
import type { CountryCode, ShoppingListRecord } from '../../types';
import { parseItems } from '../parser';
import { ensureString } from '../stringUtils';
import type { ShoppingListRepository } from './storage';

export const STORAGE_KEY = 'smart-shopping-list-v1';

export const EXAMPLE_INPUT = `milk x2
single cream
bananas x2
bread
eggs
ham slices
chicken thighs
lasagne
washing up liquid
ice-cream
cat food
paracetamol
easter eggs`;

export const defaultRecord = (): ShoppingListRecord => ({
  input: '',
  items: [],
  updatedAt: new Date().toISOString(),
  countryCode: 'uk',
});

export const localStorageRepository: ShoppingListRepository = {
  load: () => {
    if (typeof window === 'undefined') return defaultRecord();

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = defaultRecord();
      initial.items = parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]);
      return initial;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<ShoppingListRecord>;
      const countryCode: CountryCode = parsed.countryCode === 'uk' ? 'uk' : 'uk';
      const config = COUNTRY_CONFIGS[countryCode];
      return {
        input: ensureString(parsed.input),
        items: Array.isArray(parsed.items) ? parsed.items : parseItems(parsed.input ?? '', config),
        updatedAt: ensureString(parsed.updatedAt) || new Date().toISOString(),
        countryCode,
      };
    } catch {
      const initial = defaultRecord();
      initial.items = parseItems(initial.input, COUNTRY_CONFIGS[initial.countryCode]);
      return initial;
    }
  },
  save: (record) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
