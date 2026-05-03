import { createContext, useContext } from 'react';
import type { RouteViewMode } from '../types';

import type { Messages, LocaleCode } from './i18n/types';
import { SUPPORTED_LOCALES, LOCALE_STORAGE_KEY } from './i18n/types';
import { en } from './i18n/messages/en';
import { es } from './i18n/messages/es';
import { fr } from './i18n/messages/fr';
import { de } from './i18n/messages/de';
import { nl } from './i18n/messages/nl';
import { it } from './i18n/messages/it';
import { ro } from './i18n/messages/ro';
import { pi } from './i18n/messages/pi';

const MESSAGES: Record<LocaleCode, Messages> = {
  en,
  es,
  fr,
  de,
  nl,
  it,
  ro,
  pi,
};

export const isLocaleCode = (value: unknown): value is LocaleCode =>
  typeof value === 'string' && SUPPORTED_LOCALES.includes(value as LocaleCode);

export const resolveLocale = (value: unknown): LocaleCode =>
  isLocaleCode(value) ? value : 'en';

export const getRouteViewLabel = (
  mode: RouteViewMode,
  messages: Messages
): string =>
  mode === 'comfortable'
    ? messages.pages.route.viewComfortable
    : mode === 'compact'
      ? messages.pages.route.viewCompact
      : messages.pages.route.viewDefault;

export const getBrowserLocale = (language?: string): LocaleCode => {
  const effectiveLanguage =
    language ??
    (typeof window !== 'undefined' && window.navigator
      ? window.navigator.language
      : undefined) ??
    (typeof navigator !== 'undefined' ? navigator.language : 'en');

  const normalizedLanguage = String(effectiveLanguage).toLowerCase();

  if (normalizedLanguage.startsWith('es')) { return 'es'; }
  if (normalizedLanguage.startsWith('fr')) { return 'fr'; }
  if (normalizedLanguage.startsWith('de')) { return 'de'; }
  if (normalizedLanguage.startsWith('nl')) { return 'nl'; }
  if (normalizedLanguage.startsWith('it')) { return 'it'; }
  if (normalizedLanguage.startsWith('ro')) { return 'ro'; }
  return 'en';
};

export const defaultLocale = (): LocaleCode => getBrowserLocale();

export const loadLocale = (): LocaleCode => {
  if (typeof window === 'undefined') { return defaultLocale(); }

  const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocaleCode(raw) ? raw : defaultLocale();
};

export const saveLocale = (locale: LocaleCode): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

export const getDocumentLocale = (locale: LocaleCode): string =>
  locale === 'en' ? 'en-GB' : locale === 'pi' ? 'en-x-pirate' : locale;

export const applyDocumentLocale = (locale: LocaleCode): void => {
  if (typeof document === 'undefined') { return; }
  document.documentElement.lang = getDocumentLocale(locale);
};

export const createMessages = (locale: LocaleCode): Messages =>
  MESSAGES[locale] ?? MESSAGES.en;

type I18nContextValue = {
  locale: LocaleCode;
  messages: Messages;
  setLocale: (locale: LocaleCode) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = I18nContext.Provider;

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export type { LocaleCode, Messages } from './i18n/types';
export { SUPPORTED_LOCALES, LOCALE_STORAGE_KEY } from './i18n/types';
