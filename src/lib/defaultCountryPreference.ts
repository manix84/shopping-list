import { isCountryCode } from '../config/countries';
import type { CountryCode } from '../types';
import { readLocalStorageValue } from './storageKeys';

export const DEFAULT_COUNTRY_STORAGE_KEY = 'shoppingList:defaultCountry';
const LEGACY_DEFAULT_COUNTRY_STORAGE_KEYS = ['smart-shopping-list-default-country-v1'] as const;
export const AUTO_DETECT_COUNTRY = 'auto';

export type DefaultCountryPreference = CountryCode | typeof AUTO_DETECT_COUNTRY;

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
  let canonicalLanguage = language;
  if (typeof Intl !== 'undefined' && typeof Intl.getCanonicalLocales === 'function') {
    try {
      canonicalLanguage = Intl.getCanonicalLocales(language)[0] ?? language;
    } catch {
      canonicalLanguage = language;
    }
  }

  const region = canonicalLanguage
    .split('-')
    .find((part, index) => index > 0 && /^[a-z]{2}$/i.test(part))?.toUpperCase();

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

export const loadDefaultCountryPreference = (): DefaultCountryPreference | undefined => {
  if (typeof window === 'undefined') { return undefined; }

  const raw = readLocalStorageValue(DEFAULT_COUNTRY_STORAGE_KEY, LEGACY_DEFAULT_COUNTRY_STORAGE_KEYS);
  if (raw === AUTO_DETECT_COUNTRY) { return AUTO_DETECT_COUNTRY; }
  return isCountryCode(raw) ? raw : undefined;
};

export const saveDefaultCountryPreference = (preference: DefaultCountryPreference): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(DEFAULT_COUNTRY_STORAGE_KEY, preference);
};

export const defaultCountryCode = (): CountryCode => {
  const preference = loadDefaultCountryPreference();
  return preference && preference !== AUTO_DETECT_COUNTRY ? preference : inferDefaultCountryCode();
};
