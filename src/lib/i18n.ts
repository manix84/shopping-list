import { createContext, useContext } from 'react';
import type { RouteViewMode } from '../types';

export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'smart-shopping-list-locale-v1';

type Messages = {
  app: {
    title: string;
    subtitle: string;
  };
  nav: {
    shoppingList: string;
    sections: string;
    settings: string;
    debugTools: string;
  };
  actions: {
    add: string;
    backToEdit: string;
    backToSettings: string;
    copy: string;
    createSharedLink: string;
    creating: string;
    editList: string;
    fullReset: string;
    goToEditList: string;
    loadSharedList: string;
    openDebugTools: string;
    refresh: string;
    refreshing: string;
    remove: string;
    scanQrCode: string;
    stopScanning: string;
    resetTicks: string;
    revealQrCode: string;
    resortFromList: string;
    saveAndSort: string;
    tick: string;
    tickAll: string;
    untick: string;
    untickAll: string;
  };
  labels: {
    available: string;
    cleaned: string;
    count: string;
    countryProfile: string;
    created: string;
    defaultList: string;
    done: string;
    empty: string;
    exists: string;
    group: string;
    items: string;
    locale: string;
    mode: string;
    order: string;
    progress: string;
    qty: string;
    routeOrder: string;
    section: string;
    sharedLink: string;
    sharedLists: string;
    size: string;
    state: string;
    storedLocally: string;
    theme: string;
    unavailable: string;
    unknown: string;
    updated: string;
  };
  pages: {
    edit: {
      title: string;
      subtitle: string;
      pasteLabel: string;
      pastePlaceholder: string;
      quickAddLabel: string;
      quickAddPlaceholder: string;
      sharingTitle: string;
      sharingSubtitle: string;
      sharingUnavailable: string;
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
      viewDefault: string;
      viewComfortable: string;
      viewCompact: string;
    };
    settings: {
      title: string;
      subtitle: string;
      countryLabel: string;
      themeLabel: string;
      localeLabel: string;
      routeDensityLabel: string;
      routeDensitySubtitle: string;
    };
    sections: {
      title: string;
      subtitle: string;
    };
    debug: {
      title: string;
      subtitle: string;
      backendTitle: string;
      backendConnected: string;
      backendChecking: string;
      backendError: string;
      backendOffline: string;
      backendHealthTitle: string;
      backendHealthExpected: string;
      databaseTitle: string;
      databaseExpected: string;
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
      unavailable: string;
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
  backendStatus: {
    connected: string;
    checking: string;
    issue: string;
    frontendOnly: string;
  };
  sharing: {
    cameraUnavailable: string;
    connectBackendFirst: string;
    createFailed: string;
    emptyList: string;
    invalidLink: string;
    loadFailed: string;
    loadMissing: string;
    manualLinkLabel: string;
    manualLinkPlaceholder: string;
    refreshMissing: string;
    refreshFailed: string;
    offlineBackup: string;
    recentListsEmpty: string;
    recentListsTitle: string;
    scannerInstructions: string;
    scannerListMissing: string;
    scannerOpenFailed: string;
    scannerReady: string;
    scannerUnsupported: string;
  };
  sectionToggle: {
    tickAll: string;
    untickAll: string;
  };
};

const en: Messages = {
  app: {
    title: 'Smart Shopping List',
    subtitle: 'Turn a rough grocery list into an ordered route through the store.',
  },
  nav: {
    shoppingList: 'Shopping List',
    sections: 'Sections',
    settings: 'Settings',
    debugTools: 'Debug tools',
  },
  actions: {
    add: 'Add',
    backToEdit: 'Back to edit',
    backToSettings: 'Back to settings',
    copy: 'Copy',
    createSharedLink: 'Create shared link',
    creating: 'Creating...',
    editList: 'Edit list',
    fullReset: 'New List',
    goToEditList: 'Go to Edit list',
    loadSharedList: 'Load shared list',
    openDebugTools: 'Open debug tools',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    remove: 'Remove',
    scanQrCode: 'Scan QR code',
    stopScanning: 'Stop scanning',
    resetTicks: 'Reset ticks',
    revealQrCode: 'Reveal QR code',
    resortFromList: 'Re-sort from list',
    saveAndSort: 'Save list',
    tick: 'Tick',
    tickAll: 'Tick all items',
    untick: 'Untick',
    untickAll: 'Untick all items',
  },
  labels: {
    available: 'available',
    cleaned: 'Cleaned',
    count: 'count',
    countryProfile: 'Country profile',
    created: 'created',
    defaultList: 'default list',
    done: 'Done',
    empty: 'empty',
    exists: 'exists',
    group: 'Group',
    items: 'Items',
    locale: 'Language',
    mode: 'mode',
    order: 'Order',
    progress: 'Progress',
    qty: 'Qty',
    routeOrder: 'Route order',
    section: 'Section',
    sharedLink: 'Shared link',
    sharedLists: 'shared lists',
    size: 'Size',
    state: 'state',
    storedLocally: 'Stored locally on this device only.',
    theme: 'Theme',
    unavailable: 'Unavailable',
    unknown: 'unknown',
    updated: 'updated',
  },
  pages: {
    edit: {
      title: 'List editor',
      subtitle: 'Paste from anywhere, tweak the list, and save it locally for now.',
      pasteLabel: 'Paste or type your list',
      pastePlaceholder: 'milk\nbread\napples\ncoffee',
      quickAddLabel: 'Quick add single item',
      quickAddPlaceholder: 'e.g. bananas x20',
      sharingTitle: 'Sharing',
      sharingSubtitle: 'Anyone with the shared link can edit this list.',
      sharingUnavailable: 'Sharing is available when the backend is connected.',
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
      viewDefault: 'Default view',
      viewComfortable: 'Comfortable view',
      viewCompact: 'Compact view',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Preferences that affect how this device displays and groups shopping lists.',
      countryLabel: 'Country profile',
      themeLabel: 'Theme',
      localeLabel: 'Language',
      routeDensityLabel: 'Route density',
      routeDensitySubtitle: 'How the shopping route is spaced on this device.',
    },
    sections: {
      title: 'Sections',
      subtitle: 'Read-only store grouping reference for the selected country profile.',
    },
    debug: {
      title: 'Debug tools',
      subtitle: 'Self-checks and parser diagnostics live here instead of cluttering the main flow.',
      backendTitle: 'Backend checks',
      backendConnected: 'Backend API and database are available.',
      backendChecking: 'Backend status is being checked.',
      backendError: 'Backend responded, but one or more checks failed.',
      backendOffline: 'Backend is offline; the app is using frontend-only storage.',
      backendHealthTitle: 'Backend health',
      backendHealthExpected: 'GET /api/health returns OK',
      databaseTitle: 'Database',
      databaseExpected: 'GET /api/database/status can read the backend store',
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
      unavailable: 'Unavailable',
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
  backendStatus: {
    connected: 'Online',
    checking: 'Checking',
    issue: 'Offline',
    frontendOnly: 'Offline',
  },
  sharing: {
    cameraUnavailable: 'Camera access is not available on this device.',
    connectBackendFirst: 'Connect the backend before creating a shared link.',
    createFailed: 'Could not create the shared link.',
    emptyList: 'Empty list',
    invalidLink: 'Enter a valid shared list URL or UUID.',
    loadFailed: 'Could not load that shared list.',
    loadMissing: 'That shared list does not exist in the backend.',
    manualLinkLabel: 'Open a shared list',
    manualLinkPlaceholder: 'Paste a shared URL or UUID',
    refreshMissing: 'This shared list does not exist yet. Edits will create it.',
    refreshFailed: 'Could not refresh the shared list.',
    offlineBackup: 'Backend is offline. Showing the local backup for this shared list.',
    recentListsEmpty: 'No shared lists have been opened on this device yet.',
    recentListsTitle: 'Recently opened shared lists',
    scannerInstructions: 'Point the camera at a Smart Shopping List QR code.',
    scannerListMissing: 'That shared list does not exist.',
    scannerOpenFailed: 'Could not open the camera for QR scanning.',
    scannerReady: 'Shared list found. Review the input, then load it.',
    scannerUnsupported: 'QR scanning is not supported in this browser. Paste the URL or UUID instead.',
  },
  sectionToggle: {
    tickAll: 'Tick all items',
    untickAll: 'Untick all items',
  },
};

const es: Messages = {
  app: {
    title: 'Lista de la compra inteligente',
    subtitle: 'Convierte una lista rápida en una ruta ordenada por la tienda.',
  },
  nav: {
    shoppingList: 'Lista de la compra',
    sections: 'Secciones',
    settings: 'Ajustes',
    debugTools: 'Herramientas de depuración',
  },
  actions: {
    add: 'Añadir',
    backToEdit: 'Volver a editar',
    backToSettings: 'Volver a ajustes',
    copy: 'Copiar',
    createSharedLink: 'Crear enlace compartido',
    creating: 'Creando...',
    editList: 'Editar lista',
    fullReset: 'Nueva lista',
    goToEditList: 'Ir a Editar lista',
    loadSharedList: 'Abrir lista compartida',
    openDebugTools: 'Abrir herramientas de depuración',
    refresh: 'Actualizar',
    refreshing: 'Actualizando...',
    remove: 'Eliminar',
    scanQrCode: 'Escanear QR',
    stopScanning: 'Detener escaneo',
    resetTicks: 'Quitar marcas',
    revealQrCode: 'Mostrar código QR',
    resortFromList: 'Reordenar desde la lista',
    saveAndSort: 'Guardar lista',
    tick: 'Marcar',
    tickAll: 'Marcar todo',
    untick: 'Desmarcar',
    untickAll: 'Desmarcar todo',
  },
  labels: {
    available: 'disponible',
    cleaned: 'Limpio',
    count: 'cantidad',
    countryProfile: 'Perfil de país',
    created: 'creada',
    defaultList: 'lista predeterminada',
    done: 'Hecho',
    empty: 'vacía',
    exists: 'existe',
    group: 'Grupo',
    items: 'Artículos',
    locale: 'Idioma',
    mode: 'modo',
    order: 'Orden',
    progress: 'Progreso',
    qty: 'Cant.',
    routeOrder: 'Orden de ruta',
    section: 'Sección',
    sharedLink: 'Enlace compartido',
    sharedLists: 'listas compartidas',
    size: 'Tamaño',
    state: 'estado',
    storedLocally: 'Guardado solo en este dispositivo.',
    theme: 'Tema',
    unavailable: 'No disponible',
    unknown: 'desconocido',
    updated: 'actualizado',
  },
  pages: {
    edit: {
      title: 'Editor de lista',
      subtitle: 'Pega desde cualquier sitio, ajusta la lista y guárdala localmente por ahora.',
      pasteLabel: 'Pega o escribe tu lista',
      pastePlaceholder: 'leche\npan\nmanzanas\ncafé',
      quickAddLabel: 'Añadir un artículo rápido',
      quickAddPlaceholder: 'p. ej. plátanos x20',
      sharingTitle: 'Compartir',
      sharingSubtitle: 'Cualquier persona con el enlace compartido puede editar esta lista.',
      sharingUnavailable: 'Compartir está disponible cuando el backend está conectado.',
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
      viewDefault: 'Vista predeterminada',
      viewComfortable: 'Vista cómoda',
      viewCompact: 'Vista compacta',
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Preferencias que afectan a cómo este dispositivo muestra y agrupa las listas de la compra.',
      countryLabel: 'Perfil de país',
      themeLabel: 'Tema',
      localeLabel: 'Idioma',
      routeDensityLabel: 'Densidad de la ruta',
      routeDensitySubtitle: 'Cómo se espacia la ruta de compra en este dispositivo.',
    },
    sections: {
      title: 'Secciones',
      subtitle: 'Referencia de agrupación de tienda de solo lectura para el perfil de país seleccionado.',
    },
    debug: {
      title: 'Herramientas de depuración',
      subtitle: 'Las comprobaciones y diagnósticos viven aquí en vez de saturar el flujo principal.',
      backendTitle: 'Comprobaciones del backend',
      backendConnected: 'La API del backend y la base de datos están disponibles.',
      backendChecking: 'Se está comprobando el estado del backend.',
      backendError: 'El backend respondió, pero una o más comprobaciones fallaron.',
      backendOffline: 'El backend está sin conexión; la aplicación usa almacenamiento solo de frontend.',
      backendHealthTitle: 'Estado del backend',
      backendHealthExpected: 'GET /api/health devuelve OK',
      databaseTitle: 'Base de datos',
      databaseExpected: 'GET /api/database/status puede leer el almacenamiento del backend',
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
      unavailable: 'No disponible',
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
  backendStatus: {
    connected: 'En línea',
    checking: 'Comprobando',
    issue: 'Sin conexión',
    frontendOnly: 'Sin conexión',
  },
  sharing: {
    cameraUnavailable: 'El acceso a la cámara no está disponible en este dispositivo.',
    connectBackendFirst: 'Conecta el backend antes de crear un enlace compartido.',
    createFailed: 'No se pudo crear el enlace compartido.',
    emptyList: 'Lista vacía',
    invalidLink: 'Introduce una URL o UUID de lista compartida válido.',
    loadFailed: 'No se pudo abrir esa lista compartida.',
    loadMissing: 'Esa lista compartida no existe en el backend.',
    manualLinkLabel: 'Abrir una lista compartida',
    manualLinkPlaceholder: 'Pega una URL compartida o un UUID',
    refreshMissing: 'Esta lista compartida aún no existe. Las ediciones la crearán.',
    refreshFailed: 'No se pudo actualizar la lista compartida.',
    offlineBackup: 'El backend está sin conexión. Se muestra la copia local de esta lista compartida.',
    recentListsEmpty: 'Todavía no se ha abierto ninguna lista compartida en este dispositivo.',
    recentListsTitle: 'Listas compartidas abiertas recientemente',
    scannerInstructions: 'Apunta la cámara a un código QR de Smart Shopping List.',
    scannerListMissing: 'Esa lista compartida no existe.',
    scannerOpenFailed: 'No se pudo abrir la cámara para escanear el QR.',
    scannerReady: 'Lista compartida encontrada. Revisa el campo y ábrela.',
    scannerUnsupported: 'El escaneo QR no es compatible con este navegador. Pega la URL o el UUID.',
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
  typeof value === 'string' && SUPPORTED_LOCALES.includes(value as LocaleCode);

export const resolveLocale = (value: unknown): LocaleCode => (isLocaleCode(value) ? value : 'en');

export const getRouteViewLabel = (
  mode: RouteViewMode,
  messages: Messages,
): string =>
  mode === 'comfortable'
    ? messages.pages.route.viewComfortable
    : mode === 'compact'
      ? messages.pages.route.viewCompact
      : messages.pages.route.viewDefault;

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
