import { COUNTRY_CONFIGS } from '../../config/countries';
import type { CountryCode, ShoppingListRecord } from '../../types';
import { parseItems } from '../parser';
import { createUuidV7 } from '../uuid';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './recordCodec';
import type { ShoppingListRepository } from './storage';

export const STORAGE_KEY = 'smart-shopping-list-v1';

const COUNTRY_BY_REGION: Record<string, CountryCode> = {
  BE: 'be',
  CA: 'ca',
  DE: 'de',
  ES: 'es',
  FR: 'fr',
  GB: 'uk',
  IE: 'uk',
  IT: 'it',
  MX: 'mx',
  NL: 'nl',
  RO: 'ro',
  UK: 'uk',
  US: 'us',
};

const COUNTRY_BY_TIME_ZONE: Record<string, CountryCode> = {
  'America/Chicago': 'us',
  'America/Denver': 'us',
  'America/Detroit': 'us',
  'America/Indiana/Indianapolis': 'us',
  'America/Los_Angeles': 'us',
  'America/New_York': 'us',
  'America/Phoenix': 'us',
  'America/Toronto': 'ca',
  'America/Vancouver': 'ca',
  'America/Mexico_City': 'mx',
  'Europe/Amsterdam': 'nl',
  'Europe/Berlin': 'de',
  'Europe/Brussels': 'be',
  'Europe/Bucharest': 'ro',
  'Europe/London': 'uk',
  'Europe/Madrid': 'es',
  'Europe/Paris': 'fr',
  'Europe/Rome': 'it',
};

const countryFromLanguage = (language: string): CountryCode | undefined => {
  const region = language
    .split('-')
    .find((part) => part.length === 2 && part.toUpperCase() === part)?.toUpperCase();

  return region ? COUNTRY_BY_REGION[region] : undefined;
};

export const inferDefaultCountryCode = (): CountryCode => {
  if (typeof navigator !== 'undefined') {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
    const languageMatch = languages
      .filter((language): language is string => typeof language === 'string')
      .map(countryFromLanguage)
      .find((countryCode): countryCode is CountryCode => Boolean(countryCode));

    if (languageMatch) { return languageMatch; }
  }

  if (typeof Intl !== 'undefined') {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && COUNTRY_BY_TIME_ZONE[timeZone]) {
      return COUNTRY_BY_TIME_ZONE[timeZone];
    }
  }

  return 'uk';
};

export const defaultRecord = (): ShoppingListRecord => ({
  listId: createUuidV7(),
  serverBacked: false,
  input: '',
  items: [],
  updatedAt: new Date().toISOString(),
  countryCode: inferDefaultCountryCode(),
});

export const localStorageRepository = {
  load: () => {
    if (typeof window === 'undefined') { return defaultRecord(); }

    const raw = window.localStorage.getItem(STORAGE_KEY);
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
  return window.localStorage.getItem(STORAGE_KEY) !== null;
};
