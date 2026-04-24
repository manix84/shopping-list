import { createContext, useContext } from 'react';

export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'smart-shopping-list-locale-v1';

type Messages = {
  app: {
    title: string;
    subtitle: string;
  };
  nav: {
    editList: string;
    storeRoute: string;
    settings: string;
    debugTools: string;
  };
  actions: {
    add: string;
    backToEdit: string;
    backToSettings: string;
    fullReset: string;
    goToEditList: string;
    openDebugTools: string;
    remove: string;
    resetTicks: string;
    resortFromList: string;
    saveAndSort: string;
    tick: string;
    tickAll: string;
    untick: string;
    untickAll: string;
  };
  labels: {
    cleaned: string;
    countryProfile: string;
    done: string;
    group: string;
    items: string;
    locale: string;
    order: string;
    progress: string;
    qty: string;
    section: string;
    size: string;
    storedLocally: string;
    theme: string;
  };
  pages: {
    edit: {
      title: string;
      subtitle: string;
      pasteLabel: string;
      pastePlaceholder: string;
      quickAddLabel: string;
      quickAddPlaceholder: string;
      parsedTitle: string;
      parsedSubtitle: string;
      parsedEmpty: string;
    };
    route: {
      title: string;
      subtitle: string;
      filterPlaceholder: string;
      emptyNoItems: string;
      emptyNoResults: string;
    };
    settings: {
      title: string;
      subtitle: string;
      countryLabel: string;
      themeLabel: string;
      localeLabel: string;
    };
    debug: {
      title: string;
      subtitle: string;
      matcherTitle: string;
      matcherSubtitle: string;
      quantityTitle: string;
      quantitySubtitle: string;
      storageTitle: string;
      storageSubtitle: string;
      allMatcherPass: string;
      allQuantityPass: string;
      allStoragePass: string;
      expected: string;
      got: string;
      pass: string;
      fail: string;
    };
  };
  localeOptions: Record<LocaleCode, string>;
  themeOptions: {
    system: string;
    light: string;
    dark: string;
  };
  mobileMenu: {
    openNavigation: string;
  };
  sectionToggle: {
    tickAll: string;
    untickAll: string;
  };
};

const en: Messages = {
  app: {
    title: 'Smart Shopping List',
    subtitle: 'Country-aware supermarket routing, with the UK setup as the default.',
  },
  nav: {
    editList: 'Edit list',
    storeRoute: 'Store route',
    settings: 'Settings',
    debugTools: 'Debug tools',
  },
  actions: {
    add: 'Add',
    backToEdit: 'Back to edit',
    backToSettings: 'Back to settings',
    fullReset: 'Full reset',
    goToEditList: 'Go to Edit list',
    openDebugTools: 'Open debug tools',
    remove: 'Remove',
    resetTicks: 'Reset ticks',
    resortFromList: 'Re-sort from list',
    saveAndSort: 'Save and sort',
    tick: 'Tick',
    tickAll: 'Tick all items',
    untick: 'Untick',
    untickAll: 'Untick all items',
  },
  labels: {
    cleaned: 'Cleaned',
    countryProfile: 'Country profile',
    done: 'Done',
    group: 'Group',
    items: 'Items',
    locale: 'Language',
    order: 'Order',
    progress: 'Progress',
    qty: 'Qty',
    section: 'Section',
    size: 'Size',
    storedLocally: 'Stored locally on this device only.',
    theme: 'Theme',
  },
  pages: {
    edit: {
      title: 'List editor',
      subtitle: 'Paste from anywhere, tweak the list, and save it locally for now.',
      pasteLabel: 'Paste or type your list',
      pastePlaceholder: 'milk\nbread\napples\ncoffee',
      quickAddLabel: 'Quick add single item',
      quickAddPlaceholder: 'e.g. bananas x20',
      parsedTitle: 'Parsed items',
      parsedSubtitle: 'Structured items, ready for local storage today and a database later.',
      parsedEmpty: 'Save and sort the list to generate structured shopping items.',
    },
    route: {
      title: 'Store route',
      subtitle: 'Incomplete sections stay near the top. Fully completed sections drop to the bottom.',
      filterPlaceholder: 'Filter items',
      emptyNoItems: 'You need to add items on the Edit list page before the store route can be shown.',
      emptyNoResults: 'Nothing to show yet. Head back to the edit page and add some items.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Country configs are explicit, so store grouping can vary by region later.',
      countryLabel: 'Country profile',
      themeLabel: 'Theme',
      localeLabel: 'Language',
    },
    debug: {
      title: 'Debug tools',
      subtitle: 'Self-checks and parser diagnostics live here instead of cluttering the main flow.',
      matcherTitle: 'Matcher self-checks',
      matcherSubtitle: 'Lightweight checks so grouping regressions are obvious while building.',
      quantityTitle: 'Quantity self-checks',
      quantitySubtitle: 'Count-style quantities stay as one checkable item, with quantity metadata attached.',
      storageTitle: 'Storage self-checks',
      storageSubtitle: 'Record data should round-trip cleanly through local storage and any future database store.',
      allMatcherPass: 'All matcher checks are passing.',
      allQuantityPass: 'All quantity checks are passing.',
      allStoragePass: 'All storage checks are passing.',
      expected: 'expected',
      got: 'got',
      pass: 'Pass',
      fail: 'Fail',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
  },
  themeOptions: {
    system: 'System preference',
    light: 'Light',
    dark: 'Dark',
  },
  mobileMenu: {
    openNavigation: 'Open navigation menu',
  },
  sectionToggle: {
    tickAll: 'Tick all items',
    untickAll: 'Untick all items',
  },
};

const es: Messages = {
  app: {
    title: 'Lista de la compra inteligente',
    subtitle: 'Rutas de supermercado por país, con la configuración del Reino Unido como valor predeterminado.',
  },
  nav: {
    editList: 'Editar lista',
    storeRoute: 'Ruta de compra',
    settings: 'Ajustes',
    debugTools: 'Herramientas de depuración',
  },
  actions: {
    add: 'Añadir',
    backToEdit: 'Volver a editar',
    backToSettings: 'Volver a ajustes',
    fullReset: 'Restablecer todo',
    goToEditList: 'Ir a Editar lista',
    openDebugTools: 'Abrir herramientas de depuración',
    remove: 'Eliminar',
    resetTicks: 'Quitar marcas',
    resortFromList: 'Reordenar desde la lista',
    saveAndSort: 'Guardar y ordenar',
    tick: 'Marcar',
    tickAll: 'Marcar todo',
    untick: 'Desmarcar',
    untickAll: 'Desmarcar todo',
  },
  labels: {
    cleaned: 'Limpio',
    countryProfile: 'Perfil de país',
    done: 'Hecho',
    group: 'Grupo',
    items: 'Artículos',
    locale: 'Idioma',
    order: 'Orden',
    progress: 'Progreso',
    qty: 'Cant.',
    section: 'Sección',
    size: 'Tamaño',
    storedLocally: 'Guardado solo en este dispositivo.',
    theme: 'Tema',
  },
  pages: {
    edit: {
      title: 'Editor de lista',
      subtitle: 'Pega desde cualquier sitio, ajusta la lista y guárdala localmente por ahora.',
      pasteLabel: 'Pega o escribe tu lista',
      pastePlaceholder: 'leche\npan\nmanzanas\ncafé',
      quickAddLabel: 'Añadir un artículo rápido',
      quickAddPlaceholder: 'p. ej. plátanos x20',
      parsedTitle: 'Artículos procesados',
      parsedSubtitle: 'Elementos estructurados, listos para almacenamiento local hoy y una base de datos después.',
      parsedEmpty: 'Guarda y ordena la lista para generar artículos estructurados.',
    },
    route: {
      title: 'Ruta de compra',
      subtitle: 'Las secciones incompletas se quedan arriba. Las completadas pasan al final.',
      filterPlaceholder: 'Filtrar artículos',
      emptyNoItems: 'Primero debes añadir artículos en la página de edición para mostrar la ruta.',
      emptyNoResults: 'Aún no hay nada que mostrar. Vuelve a la página de edición y añade algunos artículos.',
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Las configuraciones de país son explícitas, así que la agrupación puede variar por región más adelante.',
      countryLabel: 'Perfil de país',
      themeLabel: 'Tema',
      localeLabel: 'Idioma',
    },
    debug: {
      title: 'Herramientas de depuración',
      subtitle: 'Las comprobaciones y diagnósticos viven aquí en vez de saturar el flujo principal.',
      matcherTitle: 'Comprobaciones del clasificador',
      matcherSubtitle: 'Pruebas ligeras para que las regresiones de agrupación se vean enseguida al construir.',
      quantityTitle: 'Comprobaciones de cantidad',
      quantitySubtitle: 'Las cantidades numéricas siguen siendo un solo artículo comprobable, con metadatos de cantidad.',
      storageTitle: 'Comprobaciones de almacenamiento',
      storageSubtitle: 'Los datos deben redondearse limpiamente a través del almacenamiento local y cualquier futura base de datos.',
      allMatcherPass: 'Todas las comprobaciones del clasificador pasan.',
      allQuantityPass: 'Todas las comprobaciones de cantidad pasan.',
      allStoragePass: 'Todas las comprobaciones de almacenamiento pasan.',
      expected: 'esperado',
      got: 'obtenido',
      pass: 'Pasa',
      fail: 'Falla',
    },
  },
  localeOptions: {
    en: 'Inglés',
    es: 'Español',
  },
  themeOptions: {
    system: 'Preferencia del sistema',
    light: 'Claro',
    dark: 'Oscuro',
  },
  mobileMenu: {
    openNavigation: 'Abrir menú de navegación',
  },
  sectionToggle: {
    tickAll: 'Marcar todo',
    untickAll: 'Desmarcar todo',
  },
};

const MESSAGES: Record<LocaleCode, Messages> = {
  en,
  es,
};

export const isLocaleCode = (value: unknown): value is LocaleCode =>
  value === 'en' || value === 'es';

export const resolveLocale = (value: unknown): LocaleCode => (isLocaleCode(value) ? value : 'en');

export const getBrowserLocale = (language?: string): LocaleCode => {
  const effectiveLanguage =
    language ??
    (typeof window !== 'undefined' && window.navigator ? window.navigator.language : undefined) ??
    (typeof navigator !== 'undefined' ? navigator.language : 'en');

  return String(effectiveLanguage).toLowerCase().startsWith('es') ? 'es' : 'en';
};

export const defaultLocale = (): LocaleCode => getBrowserLocale();

export const loadLocale = (): LocaleCode => {
  if (typeof window === 'undefined') return defaultLocale();

  const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocaleCode(raw) ? raw : defaultLocale();
};

export const saveLocale = (locale: LocaleCode): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
};

export const getDocumentLocale = (locale: LocaleCode): string => (locale === 'en' ? 'en-GB' : locale);

export const applyDocumentLocale = (locale: LocaleCode): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = getDocumentLocale(locale);
};

export const createMessages = (locale: LocaleCode): Messages => MESSAGES[locale] ?? MESSAGES.en;

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

export type { Messages };
