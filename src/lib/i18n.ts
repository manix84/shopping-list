import { createContext, useContext } from 'react';
import type { RouteViewMode } from '../types';

export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'nl',
  'it',
  'ro',
  'pi',
] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'smart-shopping-list-locale-v1';

type Messages = {
  app: {
    title: string;
    subtitle: string;
  };
  nav: {
    editList: string;
    route: string;
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
    filterItems: string;
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
      themeSubtitle: string;
      localeLabel: string;
      localeSubtitle: string;
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
      parsedTitle: string;
      parsedSubtitle: string;
      tabParsed: string;
      tabBackend: string;
      tabMatcher: string;
      tabQuantity: string;
      tabWeights: string;
      tabSections: string;
      tabStorage: string;
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
      weightTitle: string;
      weightSubtitle: string;
      storageTitle: string;
      storageSubtitle: string;
      allMatcherPass: string;
      allQuantityPass: string;
      allWeightPass: string;
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
    subtitle:
      'Turn a rough grocery list into an ordered route through the store.',
  },
  nav: {
    editList: 'Edit list',
    route: 'Route',
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
    filterItems: 'Filter items',
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
      subtitle:
        'Paste from anywhere, tweak the list, and save it locally for now.',
      pasteLabel: 'Paste or type your list',
      pastePlaceholder: 'milk\nbread\napples\ncoffee',
      quickAddLabel: 'Quick add single item',
      quickAddPlaceholder: 'e.g. bananas x20',
      sharingTitle: 'Sharing',
      sharingSubtitle: 'Anyone with the shared link can edit this list.',
      sharingUnavailable: 'Sharing is available when the backend is connected.',
      parsedTitle: 'Parsed items',
      parsedSubtitle:
        'Structured items, ready for local storage today and a database later.',
      parsedEmpty:
        'Save and sort the list to generate structured shopping items.',
    },
    route: {
      title: 'Store route',
      subtitle:
        'Incomplete sections stay near the top. Fully completed sections drop to the bottom.',
      filterPlaceholder: 'Filter items',
      emptyNoItems:
        'You need to add items on the Edit list page before the store route can be shown.',
      emptyNoResults:
        'Nothing to show yet. Head back to the edit page and add some items.',
      viewDefault: 'Default view',
      viewComfortable: 'Comfortable view',
      viewCompact: 'Compact view',
    },
    settings: {
      title: 'Settings',
      subtitle:
        'Preferences that affect how this device displays and groups shopping lists.',
      countryLabel: 'Country profile',
      themeLabel: 'Theme',
      themeSubtitle: 'Choose the look that feels easiest to use.',
      localeLabel: 'Language',
      localeSubtitle: 'Choose the language you prefer for app text.',
      routeDensityLabel: 'Route density',
      routeDensitySubtitle: 'How the shopping route is spaced on this device.',
    },
    sections: {
      title: 'Sections',
      subtitle:
        'Read-only store grouping reference for the selected country profile.',
    },
    debug: {
      title: 'Debug tools',
      subtitle:
        'Self-checks and parser diagnostics live here instead of cluttering the main flow.',
      parsedTitle: 'Parsed items',
      parsedSubtitle:
        'Inspect and manually adjust the structured items generated from the current list.',
      tabParsed: 'Parsed',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Quantities',
      tabWeights: 'Weights',
      tabSections: 'Sections',
      tabStorage: 'Storage',
      backendTitle: 'Backend checks',
      backendConnected: 'Backend API and database are available.',
      backendChecking: 'Backend status is being checked.',
      backendError: 'Backend responded, but one or more checks failed.',
      backendOffline:
        'Backend is offline; the app is using frontend-only storage.',
      backendHealthTitle: 'Backend health',
      backendHealthExpected: 'GET /api/health returns OK',
      databaseTitle: 'Database',
      databaseExpected: 'GET /api/database/status can read the backend store',
      matcherTitle: 'Matcher self-checks',
      matcherSubtitle:
        'Lightweight checks so grouping regressions are obvious while building.',
      quantityTitle: 'Count quantity self-checks',
      quantitySubtitle:
        'Count-style quantities like x2 and 4 carrots stay attached to one checkable item.',
      weightTitle: 'Weight and unit self-checks',
      weightSubtitle:
        'Weights and units like 500g or 1.5kg stay attached as item metadata, even when a count is present.',
      storageTitle: 'Storage self-checks',
      storageSubtitle:
        'Record data should round-trip cleanly through local storage and any future database store.',
      allMatcherPass: 'All matcher checks are passing.',
      allQuantityPass: 'All count quantity checks are passing.',
      allWeightPass: 'All weight and unit checks are passing.',
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
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
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
    refreshMissing:
      'This shared list does not exist yet. Edits will create it.',
    refreshFailed: 'Could not refresh the shared list.',
    offlineBackup:
      'Backend is offline. Showing the local backup for this shared list.',
    recentListsEmpty: 'No shared lists have been opened on this device yet.',
    recentListsTitle: 'Recently opened shared lists',
    scannerInstructions: 'Point the camera at a Smart Shopping List QR code.',
    scannerListMissing: 'That shared list does not exist.',
    scannerOpenFailed: 'Could not open the camera for QR scanning.',
    scannerReady: 'Shared list found. Review the input, then load it.',
    scannerUnsupported:
      'QR scanning is not supported in this browser. Paste the URL or UUID instead.',
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
    editList: 'Editar lista',
    route: 'Ruta',
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
    filterItems: 'Filtrar artículos',
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
      subtitle:
        'Pega desde cualquier sitio, ajusta la lista y guárdala localmente por ahora.',
      pasteLabel: 'Pega o escribe tu lista',
      pastePlaceholder: 'leche\npan\nmanzanas\ncafé',
      quickAddLabel: 'Añadir un artículo rápido',
      quickAddPlaceholder: 'p. ej. plátanos x20',
      sharingTitle: 'Compartir',
      sharingSubtitle:
        'Cualquier persona con el enlace compartido puede editar esta lista.',
      sharingUnavailable:
        'Compartir está disponible cuando el backend está conectado.',
      parsedTitle: 'Artículos procesados',
      parsedSubtitle:
        'Elementos estructurados, listos para almacenamiento local hoy y una base de datos después.',
      parsedEmpty:
        'Guarda y ordena la lista para generar artículos estructurados.',
    },
    route: {
      title: 'Ruta de compra',
      subtitle:
        'Las secciones incompletas se quedan arriba. Las completadas pasan al final.',
      filterPlaceholder: 'Filtrar artículos',
      emptyNoItems:
        'Primero debes añadir artículos en la página de edición para mostrar la ruta.',
      emptyNoResults:
        'Aún no hay nada que mostrar. Vuelve a la página de edición y añade algunos artículos.',
      viewDefault: 'Vista predeterminada',
      viewComfortable: 'Vista cómoda',
      viewCompact: 'Vista compacta',
    },
    settings: {
      title: 'Ajustes',
      subtitle:
        'Preferencias que afectan a cómo este dispositivo muestra y agrupa las listas de la compra.',
      countryLabel: 'Perfil de país',
      themeLabel: 'Tema',
      themeSubtitle: 'Elige el aspecto que te resulte más cómodo de usar.',
      localeLabel: 'Idioma',
      localeSubtitle: 'Elige el idioma que prefieres para el texto de la app.',
      routeDensityLabel: 'Densidad de la ruta',
      routeDensitySubtitle:
        'Cómo se espacia la ruta de compra en este dispositivo.',
    },
    sections: {
      title: 'Secciones',
      subtitle:
        'Referencia de agrupación de tienda de solo lectura para el perfil de país seleccionado.',
    },
    debug: {
      title: 'Herramientas de depuración',
      subtitle:
        'Las comprobaciones y diagnósticos viven aquí en vez de saturar el flujo principal.',
      parsedTitle: 'Artículos procesados',
      parsedSubtitle:
        'Inspecciona y ajusta manualmente los elementos estructurados generados desde la lista actual.',
      tabParsed: 'Procesados',
      tabBackend: 'Backend',
      tabMatcher: 'Clasificador',
      tabQuantity: 'Cantidades',
      tabWeights: 'Pesos',
      tabSections: 'Secciones',
      tabStorage: 'Almacenamiento',
      backendTitle: 'Comprobaciones del backend',
      backendConnected:
        'La API del backend y la base de datos están disponibles.',
      backendChecking: 'Se está comprobando el estado del backend.',
      backendError:
        'El backend respondió, pero una o más comprobaciones fallaron.',
      backendOffline:
        'El backend está sin conexión; la aplicación usa almacenamiento solo de frontend.',
      backendHealthTitle: 'Estado del backend',
      backendHealthExpected: 'GET /api/health devuelve OK',
      databaseTitle: 'Base de datos',
      databaseExpected:
        'GET /api/database/status puede leer el almacenamiento del backend',
      matcherTitle: 'Comprobaciones del clasificador',
      matcherSubtitle:
        'Pruebas ligeras para que las regresiones de agrupación se vean enseguida al construir.',
      quantityTitle: 'Comprobaciones de cantidades contadas',
      quantitySubtitle:
        'Las cantidades como x2 y 4 zanahorias siguen unidas a un solo artículo comprobable.',
      weightTitle: 'Comprobaciones de pesos y unidades',
      weightSubtitle:
        'Los pesos y unidades como 500g o 1.5kg siguen unidos al artículo, incluso cuando también hay una cantidad.',
      storageTitle: 'Comprobaciones de almacenamiento',
      storageSubtitle:
        'Los datos deben redondearse limpiamente a través del almacenamiento local y cualquier futura base de datos.',
      allMatcherPass: 'Todas las comprobaciones del clasificador pasan.',
      allQuantityPass: 'Todas las comprobaciones de cantidades contadas pasan.',
      allWeightPass: 'Todas las comprobaciones de pesos y unidades pasan.',
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
    fr: 'Francés',
    de: 'Alemán',
    nl: 'Neerlandés',
    it: 'Italiano',
    ro: 'Rumano',
    pi: 'Pirata',
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
    cameraUnavailable:
      'El acceso a la cámara no está disponible en este dispositivo.',
    connectBackendFirst:
      'Conecta el backend antes de crear un enlace compartido.',
    createFailed: 'No se pudo crear el enlace compartido.',
    emptyList: 'Lista vacía',
    invalidLink: 'Introduce una URL o UUID de lista compartida válido.',
    loadFailed: 'No se pudo abrir esa lista compartida.',
    loadMissing: 'Esa lista compartida no existe en el backend.',
    manualLinkLabel: 'Abrir una lista compartida',
    manualLinkPlaceholder: 'Pega una URL compartida o un UUID',
    refreshMissing:
      'Esta lista compartida aún no existe. Las ediciones la crearán.',
    refreshFailed: 'No se pudo actualizar la lista compartida.',
    offlineBackup:
      'El backend está sin conexión. Se muestra la copia local de esta lista compartida.',
    recentListsEmpty:
      'Todavía no se ha abierto ninguna lista compartida en este dispositivo.',
    recentListsTitle: 'Listas compartidas abiertas recientemente',
    scannerInstructions:
      'Apunta la cámara a un código QR de Smart Shopping List.',
    scannerListMissing: 'Esa lista compartida no existe.',
    scannerOpenFailed: 'No se pudo abrir la cámara para escanear el QR.',
    scannerReady: 'Lista compartida encontrada. Revisa el campo y ábrela.',
    scannerUnsupported:
      'El escaneo QR no es compatible con este navegador. Pega la URL o el UUID.',
  },
  sectionToggle: {
    tickAll: 'Marcar todo',
    untickAll: 'Desmarcar todo',
  },
};

const fr: Messages = {
  ...en,
  app: {
    title: 'Liste de courses intelligente',
    subtitle:
      'Transformez une liste rapide en parcours ordonné dans le magasin.',
  },
  nav: {
    editList: 'Modifier la liste',
    route: 'Parcours',
    sections: 'Sections',
    settings: 'Paramètres',
    debugTools: 'Outils de débogage',
  },
  actions: {
    ...en.actions,
    add: 'Ajouter',
    backToEdit: 'Retour à l’édition',
    backToSettings: 'Retour aux paramètres',
    copy: 'Copier',
    createSharedLink: 'Créer un lien partagé',
    creating: 'Création...',
    editList: 'Modifier la liste',
    fullReset: 'Nouvelle liste',
    goToEditList: 'Aller à la liste',
    loadSharedList: 'Ouvrir la liste partagée',
    openDebugTools: 'Ouvrir les outils de débogage',
    filterItems: 'Filtrer les articles',
    refresh: 'Actualiser',
    refreshing: 'Actualisation...',
    remove: 'Supprimer',
    scanQrCode: 'Scanner le QR code',
    stopScanning: 'Arrêter le scan',
    resetTicks: 'Réinitialiser les coches',
    revealQrCode: 'Afficher le QR code',
    resortFromList: 'Réordonner depuis la liste',
    saveAndSort: 'Enregistrer la liste',
    tick: 'Cocher',
    tickAll: 'Tout cocher',
    untick: 'Décocher',
    untickAll: 'Tout décocher',
  },
  labels: {
    ...en.labels,
    available: 'disponible',
    cleaned: 'Nettoyé',
    count: 'nombre',
    countryProfile: 'Profil pays',
    created: 'créé',
    defaultList: 'liste par défaut',
    done: 'Terminé',
    empty: 'vide',
    exists: 'existe',
    group: 'Groupe',
    items: 'Articles',
    locale: 'Langue',
    mode: 'mode',
    order: 'Ordre',
    progress: 'Progression',
    qty: 'Qté',
    routeOrder: 'Ordre du parcours',
    section: 'Section',
    sharedLink: 'Lien partagé',
    sharedLists: 'listes partagées',
    size: 'Taille',
    state: 'état',
    storedLocally: 'Enregistré localement sur cet appareil uniquement.',
    theme: 'Thème',
    unavailable: 'Indisponible',
    unknown: 'inconnu',
    updated: 'mis à jour',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Éditeur de liste',
      subtitle:
        'Collez depuis n’importe où, ajustez la liste et enregistrez-la localement pour le moment.',
      pasteLabel: 'Collez ou saisissez votre liste',
      pastePlaceholder: 'lait\npain\npommes\ncafé',
      quickAddLabel: 'Ajout rapide d’un article',
      quickAddPlaceholder: 'ex. bananes x20',
      sharingTitle: 'Partage',
      sharingSubtitle:
        'Toute personne ayant le lien partagé peut modifier cette liste.',
      sharingUnavailable:
        'Le partage est disponible lorsque le backend est connecté.',
      parsedTitle: 'Articles analysés',
      parsedSubtitle:
        'Articles structurés, prêts pour le stockage local aujourd’hui et une base de données plus tard.',
      parsedEmpty:
        'Enregistrez et triez la liste pour générer des articles structurés.',
    },
    route: {
      title: 'Parcours magasin',
      subtitle:
        'Les sections incomplètes restent en haut. Les sections terminées descendent en bas.',
      filterPlaceholder: 'Filtrer les articles',
      emptyNoItems:
        'Ajoutez d’abord des articles sur la page d’édition avant d’afficher le parcours.',
      emptyNoResults:
        'Rien à afficher pour le moment. Revenez à l’édition et ajoutez quelques articles.',
      viewDefault: 'Vue par défaut',
      viewComfortable: 'Vue confortable',
      viewCompact: 'Vue compacte',
    },
    settings: {
      title: 'Paramètres',
      subtitle:
        'Préférences qui influencent la façon dont cet appareil affiche et groupe les listes de courses.',
      countryLabel: 'Profil pays',
      themeLabel: 'Thème',
      themeSubtitle: 'Choisissez l’apparence la plus agréable à utiliser.',
      localeLabel: 'Langue',
      localeSubtitle: 'Choisissez la langue que vous préférez pour l’interface.',
      routeDensityLabel: 'Densité du parcours',
      routeDensitySubtitle:
        'Définit l’espacement du parcours sur cet appareil.',
    },
    sections: {
      title: 'Sections',
      subtitle:
        'Référence en lecture seule du regroupement du magasin pour le profil pays sélectionné.',
    },
    debug: {
      title: 'Outils de débogage',
      subtitle:
        'Les auto-vérifications et diagnostics du parseur sont regroupés ici.',
      parsedTitle: 'Articles analysés',
      parsedSubtitle:
        'Inspectez et ajustez manuellement les articles structurés générés depuis la liste actuelle.',
      tabParsed: 'Analysés',
      tabBackend: 'Backend',
      tabMatcher: 'Correspondance',
      tabQuantity: 'Quantités',
      tabWeights: 'Poids',
      tabSections: 'Sections',
      tabStorage: 'Stockage',
      backendTitle: 'Vérifications backend',
      backendConnected: 'L’API backend et la base de données sont disponibles.',
      backendChecking: 'L’état du backend est en cours de vérification.',
      backendError:
        'Le backend a répondu, mais une ou plusieurs vérifications ont échoué.',
      backendOffline:
        'Le backend est hors ligne ; l’application utilise uniquement le stockage frontend.',
      backendHealthTitle: 'Santé du backend',
      backendHealthExpected: 'GET /api/health renvoie OK',
      databaseTitle: 'Base de données',
      databaseExpected:
        'GET /api/database/status peut lire le stockage backend',
      matcherTitle: 'Auto-vérifications du moteur de correspondance',
      matcherSubtitle:
        'Des vérifications légères pour rendre évidentes les régressions de regroupement.',
      quantityTitle: 'Auto-vérifications des quantités comptées',
      quantitySubtitle:
        'Les quantités comme x2 et 4 carottes restent attachées à un seul article cochable.',
      weightTitle: 'Auto-vérifications des poids et unités',
      weightSubtitle:
        'Les poids et unités comme 500g ou 1.5kg restent attachés à l’article, même avec une quantité.',
      storageTitle: 'Auto-vérifications du stockage',
      storageSubtitle:
        'Les données doivent se relire proprement depuis le stockage local et toute future base.',
      allMatcherPass:
        'Toutes les vérifications du moteur de correspondance sont valides.',
      allQuantityPass:
        'Toutes les vérifications de quantités comptées sont valides.',
      allWeightPass:
        'Toutes les vérifications de poids et unités sont valides.',
      allStoragePass: 'Toutes les vérifications de stockage sont valides.',
      expected: 'attendu',
      got: 'obtenu',
      pass: 'Réussi',
      fail: 'Échec',
      unavailable: 'Indisponible',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Préférence système',
    light: 'Clair',
    dark: 'Sombre',
  },
  mobileMenu: {
    openNavigation: 'Ouvrir le menu de navigation',
  },
  backendStatus: {
    connected: 'En ligne',
    checking: 'Vérification',
    issue: 'Hors ligne',
    frontendOnly: 'Hors ligne',
  },
  sharing: {
    cameraUnavailable:
      'L’accès à la caméra n’est pas disponible sur cet appareil.',
    connectBackendFirst: 'Connectez le backend avant de créer un lien partagé.',
    createFailed: 'Impossible de créer le lien partagé.',
    emptyList: 'Liste vide',
    invalidLink: 'Saisissez une URL ou un UUID de liste partagée valide.',
    loadFailed: 'Impossible d’ouvrir cette liste partagée.',
    loadMissing: 'Cette liste partagée n’existe pas dans le backend.',
    manualLinkLabel: 'Ouvrir une liste partagée',
    manualLinkPlaceholder: 'Collez une URL partagée ou un UUID',
    refreshMissing:
      'Cette liste partagée n’existe pas encore. Les modifications la créeront.',
    refreshFailed: 'Impossible d’actualiser la liste partagée.',
    offlineBackup:
      'Le backend est hors ligne. Affichage de la sauvegarde locale de cette liste partagée.',
    recentListsEmpty:
      'Aucune liste partagée n’a encore été ouverte sur cet appareil.',
    recentListsTitle: 'Listes partagées récemment ouvertes',
    scannerInstructions:
      'Pointez la caméra vers un QR code Smart Shopping List.',
    scannerListMissing: 'Cette liste partagée n’existe pas.',
    scannerOpenFailed: 'Impossible d’ouvrir la caméra pour scanner le QR code.',
    scannerReady: 'Liste partagée trouvée. Vérifiez le champ puis ouvrez-la.',
    scannerUnsupported:
      'Le scan QR n’est pas pris en charge par ce navigateur. Collez l’URL ou l’UUID.',
  },
  sectionToggle: {
    tickAll: 'Tout cocher',
    untickAll: 'Tout décocher',
  },
};

const de: Messages = {
  ...en,
  app: {
    title: 'Intelligente Einkaufsliste',
    subtitle:
      'Verwandle eine grobe Einkaufsliste in einen geordneten Weg durch den Laden.',
  },
  nav: {
    editList: 'Liste bearbeiten',
    route: 'Route',
    sections: 'Bereiche',
    settings: 'Einstellungen',
    debugTools: 'Debug-Werkzeuge',
  },
  actions: {
    ...en.actions,
    add: 'Hinzufügen',
    backToEdit: 'Zurück zur Bearbeitung',
    backToSettings: 'Zurück zu Einstellungen',
    copy: 'Kopieren',
    createSharedLink: 'Freigabelink erstellen',
    creating: 'Wird erstellt...',
    editList: 'Liste bearbeiten',
    fullReset: 'Neue Liste',
    goToEditList: 'Zur Liste bearbeiten',
    loadSharedList: 'Freigegebene Liste öffnen',
    openDebugTools: 'Debug-Werkzeuge öffnen',
    filterItems: 'Artikel filtern',
    refresh: 'Aktualisieren',
    refreshing: 'Wird aktualisiert...',
    remove: 'Entfernen',
    scanQrCode: 'QR-Code scannen',
    stopScanning: 'Scannen stoppen',
    resetTicks: 'Häkchen zurücksetzen',
    revealQrCode: 'QR-Code anzeigen',
    resortFromList: 'Aus Liste neu sortieren',
    saveAndSort: 'Liste speichern',
    tick: 'Abhaken',
    tickAll: 'Alle abhaken',
    untick: 'Markierung entfernen',
    untickAll: 'Alle Markierungen entfernen',
  },
  labels: {
    ...en.labels,
    available: 'verfügbar',
    cleaned: 'Bereinigt',
    count: 'Anzahl',
    countryProfile: 'Länderprofil',
    created: 'erstellt',
    defaultList: 'Standardliste',
    done: 'Erledigt',
    empty: 'leer',
    exists: 'vorhanden',
    group: 'Gruppe',
    items: 'Artikel',
    locale: 'Sprache',
    mode: 'Modus',
    order: 'Reihenfolge',
    progress: 'Fortschritt',
    qty: 'Menge',
    routeOrder: 'Routenreihenfolge',
    section: 'Bereich',
    sharedLink: 'Freigabelink',
    sharedLists: 'freigegebene Listen',
    size: 'Größe',
    state: 'Status',
    storedLocally: 'Nur lokal auf diesem Gerät gespeichert.',
    theme: 'Design',
    unavailable: 'Nicht verfügbar',
    unknown: 'unbekannt',
    updated: 'aktualisiert',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Listeneditor',
      subtitle:
        'Füge Inhalte aus beliebigen Quellen ein, passe die Liste an und speichere sie vorerst lokal.',
      pasteLabel: 'Liste einfügen oder eingeben',
      pastePlaceholder: 'milch\nbrot\näpfel\nkaffee',
      quickAddLabel: 'Schnell einen Artikel hinzufügen',
      quickAddPlaceholder: 'z. B. bananen x20',
      sharingTitle: 'Teilen',
      sharingSubtitle:
        'Jede Person mit dem Freigabelink kann diese Liste bearbeiten.',
      sharingUnavailable:
        'Teilen ist verfügbar, wenn das Backend verbunden ist.',
      parsedTitle: 'Analysierte Artikel',
      parsedSubtitle:
        'Strukturierte Artikel, bereit für lokalen Speicher heute und eine Datenbank später.',
      parsedEmpty:
        'Speichere und sortiere die Liste, um strukturierte Artikel zu erzeugen.',
    },
    route: {
      title: 'Ladenroute',
      subtitle:
        'Unvollständige Bereiche bleiben oben. Vollständig erledigte Bereiche rutschen nach unten.',
      filterPlaceholder: 'Artikel filtern',
      emptyNoItems:
        'Füge zuerst auf der Bearbeitungsseite Artikel hinzu, bevor die Route angezeigt werden kann.',
      emptyNoResults:
        'Noch nichts anzuzeigen. Gehe zurück zur Bearbeitung und füge einige Artikel hinzu.',
      viewDefault: 'Standardansicht',
      viewComfortable: 'Komfortable Ansicht',
      viewCompact: 'Kompakte Ansicht',
    },
    settings: {
      title: 'Einstellungen',
      subtitle:
        'Voreinstellungen dafür, wie dieses Gerät Einkaufslisten darstellt und gruppiert.',
      countryLabel: 'Länderprofil',
      themeLabel: 'Design',
      themeSubtitle: 'Wähle die Darstellung, die für dich am angenehmsten ist.',
      localeLabel: 'Sprache',
      localeSubtitle: 'Wähle die Sprache, in der du die App lesen möchtest.',
      routeDensityLabel: 'Routendichte',
      routeDensitySubtitle:
        'Legt fest, wie dicht die Einkaufsroute auf diesem Gerät dargestellt wird.',
    },
    sections: {
      title: 'Bereiche',
      subtitle:
        'Schreibgeschützte Referenz der Ladenbereiche für das gewählte Länderprofil.',
    },
    debug: {
      title: 'Debug-Werkzeuge',
      subtitle:
        'Selbsttests und Parserdiagnosen liegen hier statt im Hauptablauf.',
      parsedTitle: 'Analysierte Artikel',
      parsedSubtitle:
        'Prüfe und passe die strukturierten Artikel aus der aktuellen Liste manuell an.',
      tabParsed: 'Analysiert',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Mengen',
      tabWeights: 'Gewichte',
      tabSections: 'Bereiche',
      tabStorage: 'Speicher',
      backendTitle: 'Backend-Prüfungen',
      backendConnected: 'Backend-API und Datenbank sind verfügbar.',
      backendChecking: 'Backend-Status wird geprüft.',
      backendError:
        'Das Backend hat geantwortet, aber eine oder mehrere Prüfungen sind fehlgeschlagen.',
      backendOffline:
        'Das Backend ist offline; die App nutzt nur Frontend-Speicher.',
      backendHealthTitle: 'Backend-Status',
      backendHealthExpected: 'GET /api/health liefert OK',
      databaseTitle: 'Datenbank',
      databaseExpected:
        'GET /api/database/status kann den Backend-Speicher lesen',
      matcherTitle: 'Matcher-Selbsttests',
      matcherSubtitle:
        'Leichte Prüfungen, damit Gruppierungsfehler sofort sichtbar werden.',
      quantityTitle: 'Zählmengen-Selbsttests',
      quantitySubtitle:
        'Zählmengen wie x2 und 4 Karotten bleiben an einem abhackbaren Artikel hängen.',
      weightTitle: 'Gewichts- und Einheiten-Selbsttests',
      weightSubtitle:
        'Gewichte und Einheiten wie 500g oder 1.5kg bleiben am Artikel hängen, auch wenn eine Zählmenge vorhanden ist.',
      storageTitle: 'Speicher-Selbsttests',
      storageSubtitle:
        'Daten sollten sauber durch lokalen Speicher und spätere Datenbanken laufen.',
      allMatcherPass: 'Alle Matcher-Prüfungen bestehen.',
      allQuantityPass: 'Alle Zählmengen-Prüfungen bestehen.',
      allWeightPass: 'Alle Gewichts- und Einheiten-Prüfungen bestehen.',
      allStoragePass: 'Alle Speicher-Prüfungen bestehen.',
      expected: 'erwartet',
      got: 'erhalten',
      pass: 'Bestanden',
      fail: 'Fehlgeschlagen',
      unavailable: 'Nicht verfügbar',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Systemeinstellung',
    light: 'Hell',
    dark: 'Dunkel',
  },
  mobileMenu: {
    openNavigation: 'Navigationsmenü öffnen',
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Prüfung',
    issue: 'Offline',
    frontendOnly: 'Offline',
  },
  sharing: {
    cameraUnavailable: 'Kamerazugriff ist auf diesem Gerät nicht verfügbar.',
    connectBackendFirst:
      'Verbinde zuerst das Backend, bevor du einen Freigabelink erstellst.',
    createFailed: 'Der Freigabelink konnte nicht erstellt werden.',
    emptyList: 'Leere Liste',
    invalidLink:
      'Gib eine gültige URL oder UUID einer freigegebenen Liste ein.',
    loadFailed: 'Diese freigegebene Liste konnte nicht geladen werden.',
    loadMissing: 'Diese freigegebene Liste existiert nicht im Backend.',
    manualLinkLabel: 'Freigegebene Liste öffnen',
    manualLinkPlaceholder: 'Freigegebene URL oder UUID einfügen',
    refreshMissing:
      'Diese freigegebene Liste existiert noch nicht. Änderungen werden sie anlegen.',
    refreshFailed: 'Die freigegebene Liste konnte nicht aktualisiert werden.',
    offlineBackup:
      'Backend ist offline. Lokale Sicherung dieser freigegebenen Liste wird angezeigt.',
    recentListsEmpty:
      'Auf diesem Gerät wurde noch keine freigegebene Liste geöffnet.',
    recentListsTitle: 'Zuletzt geöffnete freigegebene Listen',
    scannerInstructions:
      'Richte die Kamera auf einen Smart Shopping List QR-Code.',
    scannerListMissing: 'Diese freigegebene Liste existiert nicht.',
    scannerOpenFailed:
      'Die Kamera zum Scannen des QR-Codes konnte nicht geöffnet werden.',
    scannerReady:
      'Freigegebene Liste gefunden. Prüfe das Feld und öffne sie dann.',
    scannerUnsupported:
      'QR-Scannen wird in diesem Browser nicht unterstützt. Füge die URL oder UUID ein.',
  },
  sectionToggle: {
    tickAll: 'Alle abhaken',
    untickAll: 'Alle Markierungen entfernen',
  },
};

const nl: Messages = {
  ...en,
  app: {
    title: 'Slimme boodschappenlijst',
    subtitle:
      'Maak van een ruwe boodschappenlijst een geordende route door de winkel.',
  },
  nav: {
    editList: 'Lijst bewerken',
    route: 'Route',
    sections: 'Secties',
    settings: 'Instellingen',
    debugTools: 'Debughulpmiddelen',
  },
  actions: {
    ...en.actions,
    add: 'Toevoegen',
    backToEdit: 'Terug naar bewerken',
    backToSettings: 'Terug naar instellingen',
    copy: 'Kopiëren',
    createSharedLink: 'Deellink maken',
    creating: 'Bezig met maken...',
    editList: 'Lijst bewerken',
    fullReset: 'Nieuwe lijst',
    goToEditList: 'Naar lijst bewerken',
    loadSharedList: 'Gedeelde lijst openen',
    openDebugTools: 'Debughulpmiddelen openen',
    filterItems: 'Artikelen filteren',
    refresh: 'Verversen',
    refreshing: 'Bezig met verversen...',
    remove: 'Verwijderen',
    scanQrCode: 'QR-code scannen',
    stopScanning: 'Scannen stoppen',
    resetTicks: 'Afvinkingen resetten',
    revealQrCode: 'QR-code tonen',
    resortFromList: 'Opnieuw sorteren vanuit lijst',
    saveAndSort: 'Lijst opslaan',
    tick: 'Afvinken',
    tickAll: 'Alles afvinken',
    untick: 'Afvinking verwijderen',
    untickAll: 'Alle afvinkingen verwijderen',
  },
  labels: {
    ...en.labels,
    available: 'beschikbaar',
    cleaned: 'Opgeschoond',
    count: 'aantal',
    countryProfile: 'Landprofiel',
    created: 'aangemaakt',
    defaultList: 'standaardlijst',
    done: 'Klaar',
    empty: 'leeg',
    exists: 'bestaat',
    group: 'Groep',
    items: 'Artikelen',
    locale: 'Taal',
    mode: 'modus',
    order: 'Volgorde',
    progress: 'Voortgang',
    qty: 'Aantal',
    routeOrder: 'Routevolgorde',
    section: 'Sectie',
    sharedLink: 'Deellink',
    sharedLists: 'gedeelde lijsten',
    size: 'Grootte',
    state: 'status',
    storedLocally: 'Alleen lokaal op dit apparaat opgeslagen.',
    theme: 'Thema',
    unavailable: 'Niet beschikbaar',
    unknown: 'onbekend',
    updated: 'bijgewerkt',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Lijstbewerker',
      subtitle:
        'Plak van overal, pas de lijst aan en sla hem voorlopig lokaal op.',
      pasteLabel: 'Plak of typ je lijst',
      pastePlaceholder: 'melk\nbrood\nappels\nkoffie',
      quickAddLabel: 'Snel één artikel toevoegen',
      quickAddPlaceholder: 'bijv. bananen x20',
      sharingTitle: 'Delen',
      sharingSubtitle: 'Iedereen met de deellink kan deze lijst bewerken.',
      sharingUnavailable:
        'Delen is beschikbaar wanneer de backend verbonden is.',
      parsedTitle: 'Geparseerde artikelen',
      parsedSubtitle:
        'Gestructureerde artikelen, klaar voor lokale opslag vandaag en een database later.',
      parsedEmpty:
        'Sla de lijst op en sorteer hem om gestructureerde artikelen te genereren.',
    },
    route: {
      title: 'Winkelroute',
      subtitle:
        'Onvolledige secties blijven bovenaan. Volledig afgewerkte secties zakken naar beneden.',
      filterPlaceholder: 'Artikelen filteren',
      emptyNoItems:
        'Voeg eerst artikelen toe op de bewerkpagina voordat de winkelroute getoond kan worden.',
      emptyNoResults:
        'Nog niets om te tonen. Ga terug naar bewerken en voeg wat artikelen toe.',
      viewDefault: 'Standaardweergave',
      viewComfortable: 'Comfortabele weergave',
      viewCompact: 'Compacte weergave',
    },
    settings: {
      title: 'Instellingen',
      subtitle:
        'Voorkeuren die bepalen hoe dit apparaat boodschappenlijsten toont en groepeert.',
      countryLabel: 'Landprofiel',
      themeLabel: 'Thema',
      themeSubtitle: 'Kies de weergave die voor jou het prettigst werkt.',
      localeLabel: 'Taal',
      localeSubtitle: 'Kies de taal waarin je de app het liefst leest.',
      routeDensityLabel: 'Routedichtheid',
      routeDensitySubtitle:
        'Bepaalt de spacing van de winkelroute op dit apparaat.',
    },
    sections: {
      title: 'Secties',
      subtitle:
        'Alleen-lezen referentie van winkelgroepering voor het geselecteerde landprofiel.',
    },
    debug: {
      title: 'Debughulpmiddelen',
      subtitle:
        'Zelftests en parserdiagnostiek staan hier in plaats van in de hoofdworkflow.',
      parsedTitle: 'Geparseerde artikelen',
      parsedSubtitle:
        'Controleer en pas handmatig de gestructureerde artikelen van de huidige lijst aan.',
      tabParsed: 'Geparseerd',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Hoeveelheden',
      tabWeights: 'Gewichten',
      tabSections: 'Secties',
      tabStorage: 'Opslag',
      backendTitle: 'Backendcontroles',
      backendConnected: 'Backend-API en database zijn beschikbaar.',
      backendChecking: 'Backendstatus wordt gecontroleerd.',
      backendError:
        'Backend antwoordde, maar een of meer controles zijn mislukt.',
      backendOffline:
        'Backend is offline; de app gebruikt alleen frontend-opslag.',
      backendHealthTitle: 'Backendstatus',
      backendHealthExpected: 'GET /api/health geeft OK terug',
      databaseTitle: 'Database',
      databaseExpected: 'GET /api/database/status kan de backend-opslag lezen',
      matcherTitle: 'Matcher-zelftests',
      matcherSubtitle:
        'Lichte controles zodat regressies in groepering snel zichtbaar zijn.',
      quantityTitle: 'Telhoeveelheids-zelftests',
      quantitySubtitle:
        'Telhoeveelheden zoals x2 en 4 wortels blijven gekoppeld aan één afvinkbaar artikel.',
      weightTitle: 'Gewicht- en eenheid-zelftests',
      weightSubtitle:
        'Gewichten en eenheden zoals 500g of 1.5kg blijven aan het artikel gekoppeld, ook met een telhoeveelheid.',
      storageTitle: 'Opslag-zelftests',
      storageSubtitle:
        'Gegevens moeten netjes heen en weer gaan door lokale opslag en latere databases.',
      allMatcherPass: 'Alle matcher-controles slagen.',
      allQuantityPass: 'Alle telhoeveelheidscontroles slagen.',
      allWeightPass: 'Alle gewicht- en eenheidcontroles slagen.',
      allStoragePass: 'Alle opslagcontroles slagen.',
      expected: 'verwacht',
      got: 'gekregen',
      pass: 'Geslaagd',
      fail: 'Mislukt',
      unavailable: 'Niet beschikbaar',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Systeemvoorkeur',
    light: 'Licht',
    dark: 'Donker',
  },
  mobileMenu: {
    openNavigation: 'Navigatiemenu openen',
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Controleren',
    issue: 'Offline',
    frontendOnly: 'Offline',
  },
  sharing: {
    cameraUnavailable: 'Camera-toegang is niet beschikbaar op dit apparaat.',
    connectBackendFirst:
      'Verbind eerst de backend voordat je een deellink maakt.',
    createFailed: 'De deellink kon niet worden gemaakt.',
    emptyList: 'Lege lijst',
    invalidLink: 'Voer een geldige gedeelde lijst-URL of UUID in.',
    loadFailed: 'Die gedeelde lijst kon niet worden geladen.',
    loadMissing: 'Die gedeelde lijst bestaat niet in de backend.',
    manualLinkLabel: 'Een gedeelde lijst openen',
    manualLinkPlaceholder: 'Plak een gedeelde URL of UUID',
    refreshMissing:
      'Deze gedeelde lijst bestaat nog niet. Bewerkingen zullen haar aanmaken.',
    refreshFailed: 'De gedeelde lijst kon niet worden ververst.',
    offlineBackup:
      'Backend is offline. De lokale back-up van deze gedeelde lijst wordt getoond.',
    recentListsEmpty:
      'Er zijn nog geen gedeelde lijsten op dit apparaat geopend.',
    recentListsTitle: 'Recent geopende gedeelde lijsten',
    scannerInstructions: 'Richt de camera op een Smart Shopping List QR-code.',
    scannerListMissing: 'Die gedeelde lijst bestaat niet.',
    scannerOpenFailed:
      'De camera kon niet worden geopend voor het scannen van de QR-code.',
    scannerReady:
      'Gedeelde lijst gevonden. Controleer het veld en open haar daarna.',
    scannerUnsupported:
      'QR-scannen wordt niet ondersteund in deze browser. Plak de URL of UUID.',
  },
  sectionToggle: {
    tickAll: 'Alles afvinken',
    untickAll: 'Alle afvinkingen verwijderen',
  },
};

const it: Messages = {
  ...en,
  app: {
    title: 'Lista della spesa intelligente',
    subtitle: 'Trasforma una lista veloce in un percorso ordinato nel negozio.',
  },
  nav: {
    editList: 'Modifica lista',
    route: 'Percorso',
    sections: 'Sezioni',
    settings: 'Impostazioni',
    debugTools: 'Strumenti di debug',
  },
  actions: {
    ...en.actions,
    add: 'Aggiungi',
    backToEdit: 'Torna alla modifica',
    backToSettings: 'Torna alle impostazioni',
    copy: 'Copia',
    createSharedLink: 'Crea link condiviso',
    creating: 'Creazione...',
    editList: 'Modifica lista',
    fullReset: 'Nuova lista',
    goToEditList: 'Vai alla lista',
    loadSharedList: 'Apri lista condivisa',
    openDebugTools: 'Apri strumenti di debug',
    filterItems: 'Filtra articoli',
    refresh: 'Aggiorna',
    refreshing: 'Aggiornamento...',
    remove: 'Rimuovi',
    scanQrCode: 'Scansiona QR code',
    stopScanning: 'Ferma scansione',
    resetTicks: 'Azzera spunte',
    revealQrCode: 'Mostra QR code',
    resortFromList: 'Riordina dalla lista',
    saveAndSort: 'Salva lista',
    tick: 'Spunta',
    tickAll: 'Spunta tutto',
    untick: 'Togli spunta',
    untickAll: 'Togli tutte le spunte',
  },
  labels: {
    ...en.labels,
    available: 'disponibile',
    cleaned: 'Pulito',
    count: 'conteggio',
    countryProfile: 'Profilo paese',
    created: 'creato',
    defaultList: 'lista predefinita',
    done: 'Fatto',
    empty: 'vuoto',
    exists: 'esiste',
    group: 'Gruppo',
    items: 'Articoli',
    locale: 'Lingua',
    mode: 'modalità',
    order: 'Ordine',
    progress: 'Progresso',
    qty: 'Qtà',
    routeOrder: 'Ordine del percorso',
    section: 'Sezione',
    sharedLink: 'Link condiviso',
    sharedLists: 'liste condivise',
    size: 'Misura',
    state: 'stato',
    storedLocally: 'Salvato solo localmente su questo dispositivo.',
    theme: 'Tema',
    unavailable: 'Non disponibile',
    unknown: 'sconosciuto',
    updated: 'aggiornato',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Editor lista',
      subtitle:
        'Incolla da ovunque, modifica la lista e salvala localmente per ora.',
      pasteLabel: 'Incolla o scrivi la tua lista',
      pastePlaceholder: 'latte\npane\nmele\ncaffè',
      quickAddLabel: 'Aggiungi rapidamente un articolo',
      quickAddPlaceholder: 'es. banane x20',
      sharingTitle: 'Condivisione',
      sharingSubtitle:
        'Chiunque abbia il link condiviso può modificare questa lista.',
      sharingUnavailable:
        'La condivisione è disponibile quando il backend è connesso.',
      parsedTitle: 'Articoli analizzati',
      parsedSubtitle:
        'Articoli strutturati, pronti per l’archiviazione locale oggi e un database più avanti.',
      parsedEmpty: 'Salva e ordina la lista per generare articoli strutturati.',
    },
    route: {
      title: 'Percorso nel negozio',
      subtitle:
        'Le sezioni incomplete restano in alto. Quelle completate scendono in fondo.',
      filterPlaceholder: 'Filtra articoli',
      emptyNoItems:
        'Aggiungi prima degli articoli nella pagina di modifica prima di mostrare il percorso.',
      emptyNoResults:
        'Ancora niente da mostrare. Torna alla modifica e aggiungi qualche articolo.',
      viewDefault: 'Vista predefinita',
      viewComfortable: 'Vista comoda',
      viewCompact: 'Vista compatta',
    },
    settings: {
      title: 'Impostazioni',
      subtitle:
        'Preferenze che influenzano il modo in cui questo dispositivo mostra e raggruppa le liste della spesa.',
      countryLabel: 'Profilo paese',
      themeLabel: 'Tema',
      themeSubtitle: 'Scegli l’aspetto più comodo da usare.',
      localeLabel: 'Lingua',
      localeSubtitle: 'Scegli la lingua che preferisci per leggere l’app.',
      routeDensityLabel: 'Densità del percorso',
      routeDensitySubtitle:
        'Definisce la spaziatura del percorso su questo dispositivo.',
    },
    sections: {
      title: 'Sezioni',
      subtitle:
        'Riferimento in sola lettura dei gruppi del negozio per il profilo paese selezionato.',
    },
    debug: {
      title: 'Strumenti di debug',
      subtitle:
        'Controlli automatici e diagnostica del parser vivono qui invece di occupare il flusso principale.',
      parsedTitle: 'Articoli analizzati',
      parsedSubtitle:
        'Ispeziona e regola manualmente gli articoli strutturati generati dalla lista corrente.',
      tabParsed: 'Analizzati',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Quantità',
      tabWeights: 'Pesi',
      tabSections: 'Sezioni',
      tabStorage: 'Archiviazione',
      backendTitle: 'Controlli backend',
      backendConnected: 'API backend e database sono disponibili.',
      backendChecking: 'Lo stato del backend è in fase di controllo.',
      backendError:
        'Il backend ha risposto, ma uno o più controlli sono falliti.',
      backendOffline:
        'Il backend è offline; l’app usa solo archiviazione frontend.',
      backendHealthTitle: 'Salute backend',
      backendHealthExpected: 'GET /api/health restituisce OK',
      databaseTitle: 'Database',
      databaseExpected:
        'GET /api/database/status può leggere l’archiviazione backend',
      matcherTitle: 'Autocontrolli matcher',
      matcherSubtitle:
        'Controlli leggeri per rendere evidenti le regressioni di raggruppamento.',
      quantityTitle: 'Autocontrolli quantità numeriche',
      quantitySubtitle:
        'Le quantità come x2 e 4 carote restano collegate a un solo articolo selezionabile.',
      weightTitle: 'Autocontrolli pesi e unità',
      weightSubtitle:
        'Pesi e unità come 500g o 1.5kg restano collegati all’articolo, anche quando c’è una quantità.',
      storageTitle: 'Autocontrolli archiviazione',
      storageSubtitle:
        'I dati devono attraversare correttamente lo storage locale e qualsiasi database futuro.',
      allMatcherPass: 'Tutti i controlli matcher sono superati.',
      allQuantityPass: 'Tutti i controlli quantità numeriche sono superati.',
      allWeightPass: 'Tutti i controlli pesi e unità sono superati.',
      allStoragePass: 'Tutti i controlli archiviazione sono superati.',
      expected: 'atteso',
      got: 'ottenuto',
      pass: 'OK',
      fail: 'Errore',
      unavailable: 'Non disponibile',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Preferenza di sistema',
    light: 'Chiaro',
    dark: 'Scuro',
  },
  mobileMenu: {
    openNavigation: 'Apri menu di navigazione',
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Controllo',
    issue: 'Offline',
    frontendOnly: 'Offline',
  },
  sharing: {
    cameraUnavailable:
      'L’accesso alla fotocamera non è disponibile su questo dispositivo.',
    connectBackendFirst:
      'Connetti prima il backend prima di creare un link condiviso.',
    createFailed: 'Impossibile creare il link condiviso.',
    emptyList: 'Lista vuota',
    invalidLink: 'Inserisci un URL o UUID valido di lista condivisa.',
    loadFailed: 'Impossibile aprire quella lista condivisa.',
    loadMissing: 'Quella lista condivisa non esiste nel backend.',
    manualLinkLabel: 'Apri una lista condivisa',
    manualLinkPlaceholder: 'Incolla un URL condiviso o UUID',
    refreshMissing:
      'Questa lista condivisa non esiste ancora. Le modifiche la creeranno.',
    refreshFailed: 'Impossibile aggiornare la lista condivisa.',
    offlineBackup:
      'Il backend è offline. Viene mostrata la copia locale di questa lista condivisa.',
    recentListsEmpty:
      'Nessuna lista condivisa è stata ancora aperta su questo dispositivo.',
    recentListsTitle: 'Liste condivise aperte di recente',
    scannerInstructions:
      'Punta la fotocamera su un QR code Smart Shopping List.',
    scannerListMissing: 'Quella lista condivisa non esiste.',
    scannerOpenFailed:
      'Impossibile aprire la fotocamera per la scansione del QR code.',
    scannerReady: 'Lista condivisa trovata. Controlla il campo e poi aprila.',
    scannerUnsupported:
      'La scansione QR non è supportata in questo browser. Incolla l’URL o l’UUID.',
  },
  sectionToggle: {
    tickAll: 'Spunta tutto',
    untickAll: 'Togli tutte le spunte',
  },
};

const ro: Messages = {
  ...en,
  app: {
    title: 'Listă inteligentă de cumpărături',
    subtitle: 'Transformă o listă rapidă într-un traseu ordonat prin magazin.',
  },
  nav: {
    editList: 'Editează lista',
    route: 'Traseu',
    sections: 'Secțiuni',
    settings: 'Setări',
    debugTools: 'Unelte de depanare',
  },
  actions: {
    ...en.actions,
    add: 'Adaugă',
    backToEdit: 'Înapoi la editare',
    backToSettings: 'Înapoi la setări',
    copy: 'Copiază',
    createSharedLink: 'Creează link partajat',
    creating: 'Se creează...',
    editList: 'Editează lista',
    fullReset: 'Listă nouă',
    goToEditList: 'Mergi la listă',
    loadSharedList: 'Deschide lista partajată',
    openDebugTools: 'Deschide uneltele de depanare',
    filterItems: 'Filtrează articolele',
    refresh: 'Reîmprospătează',
    refreshing: 'Se reîmprospătează...',
    remove: 'Elimină',
    scanQrCode: 'Scanează codul QR',
    stopScanning: 'Oprește scanarea',
    resetTicks: 'Resetează bifările',
    revealQrCode: 'Afișează codul QR',
    resortFromList: 'Reordonează din listă',
    saveAndSort: 'Salvează lista',
    tick: 'Bifează',
    tickAll: 'Bifează tot',
    untick: 'Debifează',
    untickAll: 'Debifează tot',
  },
  labels: {
    ...en.labels,
    available: 'disponibil',
    cleaned: 'Curățat',
    count: 'număr',
    countryProfile: 'Profil de țară',
    created: 'creat',
    defaultList: 'listă implicită',
    done: 'Gata',
    empty: 'goală',
    exists: 'există',
    group: 'Grup',
    items: 'Articole',
    locale: 'Limbă',
    mode: 'mod',
    order: 'Ordine',
    progress: 'Progres',
    qty: 'Cant.',
    routeOrder: 'Ordinea traseului',
    section: 'Secțiune',
    sharedLink: 'Link partajat',
    sharedLists: 'liste partajate',
    size: 'Mărime',
    state: 'stare',
    storedLocally: 'Stocat doar local pe acest dispozitiv.',
    theme: 'Temă',
    unavailable: 'Indisponibil',
    unknown: 'necunoscut',
    updated: 'actualizat',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Editor listă',
      subtitle:
        'Lipește de oriunde, ajustează lista și salveaz-o local deocamdată.',
      pasteLabel: 'Lipește sau scrie lista',
      pastePlaceholder: 'lapte\npâine\nmere\ncafea',
      quickAddLabel: 'Adaugă rapid un articol',
      quickAddPlaceholder: 'ex. banane x20',
      sharingTitle: 'Partajare',
      sharingSubtitle: 'Oricine are linkul partajat poate edita această listă.',
      sharingUnavailable:
        'Partajarea este disponibilă când backendul este conectat.',
      parsedTitle: 'Articole analizate',
      parsedSubtitle:
        'Articole structurate, pregătite pentru stocare locală azi și o bază de date mai târziu.',
      parsedEmpty:
        'Salvează și sortează lista pentru a genera articole structurate.',
    },
    route: {
      title: 'Traseu prin magazin',
      subtitle:
        'Secțiunile incomplete rămân sus. Secțiunile complet terminate coboară jos.',
      filterPlaceholder: 'Filtrează articolele',
      emptyNoItems:
        'Adaugă mai întâi articole în pagina de editare înainte de a afișa traseul.',
      emptyNoResults:
        'Încă nu este nimic de afișat. Revino la editare și adaugă câteva articole.',
      viewDefault: 'Vizualizare implicită',
      viewComfortable: 'Vizualizare confortabilă',
      viewCompact: 'Vizualizare compactă',
    },
    settings: {
      title: 'Setări',
      subtitle:
        'Preferințe care influențează cum acest dispozitiv afișează și grupează listele de cumpărături.',
      countryLabel: 'Profil de țară',
      themeLabel: 'Temă',
      themeSubtitle: 'Alege aspectul cel mai confortabil pentru tine.',
      localeLabel: 'Limbă',
      localeSubtitle: 'Alege limba în care preferi să citești aplicația.',
      routeDensityLabel: 'Densitatea traseului',
      routeDensitySubtitle:
        'Controlează spațierea traseului pe acest dispozitiv.',
    },
    sections: {
      title: 'Secțiuni',
      subtitle:
        'Referință doar în citire pentru gruparea magazinului în profilul de țară selectat.',
    },
    debug: {
      title: 'Unelte de depanare',
      subtitle:
        'Autoverificările și diagnosticele parserului stau aici în loc să aglomereze fluxul principal.',
      parsedTitle: 'Articole analizate',
      parsedSubtitle:
        'Inspectează și ajustează manual articolele structurate generate din lista curentă.',
      tabParsed: 'Analizate',
      tabBackend: 'Backend',
      tabMatcher: 'Potrivire',
      tabQuantity: 'Cantități',
      tabWeights: 'Greutăți',
      tabSections: 'Secțiuni',
      tabStorage: 'Stocare',
      backendTitle: 'Verificări backend',
      backendConnected: 'API-ul backend și baza de date sunt disponibile.',
      backendChecking: 'Starea backendului este verificată.',
      backendError:
        'Backendul a răspuns, dar una sau mai multe verificări au eșuat.',
      backendOffline:
        'Backendul este offline; aplicația folosește doar stocare frontend.',
      backendHealthTitle: 'Sănătate backend',
      backendHealthExpected: 'GET /api/health returnează OK',
      databaseTitle: 'Bază de date',
      databaseExpected: 'GET /api/database/status poate citi stocarea backend',
      matcherTitle: 'Autoverificări de potrivire',
      matcherSubtitle:
        'Verificări ușoare pentru a face regresiile de grupare evidente.',
      quantityTitle: 'Autoverificări de cantități numărate',
      quantitySubtitle:
        'Cantitățile precum x2 și 4 morcovi rămân atașate unui singur articol bifabil.',
      weightTitle: 'Autoverificări de greutăți și unități',
      weightSubtitle:
        'Greutățile și unitățile precum 500g sau 1.5kg rămân atașate articolului, chiar și cu o cantitate.',
      storageTitle: 'Autoverificări de stocare',
      storageSubtitle:
        'Datele trebuie să treacă curat prin stocarea locală și orice bază viitoare.',
      allMatcherPass: 'Toate verificările de potrivire trec.',
      allQuantityPass: 'Toate verificările de cantități numărate trec.',
      allWeightPass: 'Toate verificările de greutăți și unități trec.',
      allStoragePass: 'Toate verificările de stocare trec.',
      expected: 'așteptat',
      got: 'obținut',
      pass: 'Trece',
      fail: 'Eșuează',
      unavailable: 'Indisponibil',
    },
  },
  localeOptions: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Preferința sistemului',
    light: 'Deschis',
    dark: 'Închis',
  },
  mobileMenu: {
    openNavigation: 'Deschide meniul de navigare',
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Se verifică',
    issue: 'Offline',
    frontendOnly: 'Offline',
  },
  sharing: {
    cameraUnavailable:
      'Accesul la cameră nu este disponibil pe acest dispozitiv.',
    connectBackendFirst:
      'Conectează backendul înainte de a crea un link partajat.',
    createFailed: 'Nu s-a putut crea linkul partajat.',
    emptyList: 'Listă goală',
    invalidLink: 'Introdu un URL sau UUID valid pentru lista partajată.',
    loadFailed: 'Nu s-a putut deschide acea listă partajată.',
    loadMissing: 'Acea listă partajată nu există în backend.',
    manualLinkLabel: 'Deschide o listă partajată',
    manualLinkPlaceholder: 'Lipește un URL partajat sau un UUID',
    refreshMissing:
      'Această listă partajată nu există încă. Modificările o vor crea.',
    refreshFailed: 'Nu s-a putut reîmprospăta lista partajată.',
    offlineBackup:
      'Backendul este offline. Se afișează copia locală a acestei liste partajate.',
    recentListsEmpty:
      'Nicio listă partajată nu a fost deschisă încă pe acest dispozitiv.',
    recentListsTitle: 'Liste partajate deschise recent',
    scannerInstructions: 'Îndreaptă camera spre un cod QR Smart Shopping List.',
    scannerListMissing: 'Acea listă partajată nu există.',
    scannerOpenFailed:
      'Nu s-a putut deschide camera pentru scanarea codului QR.',
    scannerReady: 'Listă partajată găsită. Verifică câmpul și apoi deschide-o.',
    scannerUnsupported:
      'Scanarea QR nu este suportată în acest browser. Lipește URL-ul sau UUID-ul.',
  },
  sectionToggle: {
    tickAll: 'Bifează tot',
    untickAll: 'Debifează tot',
  },
};

const pi: Messages = {
  ...en,
  app: {
    title: 'Smart Shopping Ledger',
    subtitle:
      'Turn a rough cargo list into a tidy route through the market, matey.',
  },
  nav: {
    editList: 'Edit yer list',
    route: 'Route',
    sections: 'Decks',
    settings: 'Rigging',
    debugTools: 'Bilge tools',
  },
  actions: {
    ...en.actions,
    add: 'Add aboard',
    backToEdit: 'Back to scribblin’',
    backToSettings: 'Back to rigging',
    copy: 'Copy',
    createSharedLink: 'Forge shared chart',
    creating: 'Forgin’...',
    editList: 'Edit yer list',
    fullReset: 'Fresh ledger',
    goToEditList: 'Go to yer list',
    loadSharedList: 'Open shared ledger',
    openDebugTools: 'Open bilge tools',
    filterItems: 'Filter cargo',
    refresh: 'Refresh',
    refreshing: 'Refreshin’...',
    remove: 'Toss overboard',
    scanQrCode: 'Scan the QR chart',
    stopScanning: 'Belay the scan',
    resetTicks: 'Clear the marks',
    revealQrCode: 'Reveal QR chart',
    resortFromList: 'Sort again from ledger',
    saveAndSort: 'Stash ledger',
    tick: 'Mark',
    tickAll: 'Mark all',
    untick: 'Unmark',
    untickAll: 'Unmark all',
  },
  labels: {
    ...en.labels,
    available: 'available',
    cleaned: 'Swabbed',
    count: 'count',
    countryProfile: 'Waters profile',
    created: 'forged',
    defaultList: 'default ledger',
    done: 'Done fer',
    empty: 'empty',
    exists: 'exists',
    group: 'Crew',
    items: 'Cargo',
    locale: 'Tongue',
    mode: 'mode',
    order: 'Order',
    progress: 'Progress',
    qty: 'Qty',
    routeOrder: 'Route order',
    section: 'Deck',
    sharedLink: 'Shared chart',
    sharedLists: 'shared ledgers',
    size: 'Size',
    state: 'state',
    storedLocally: 'Stowed only on this here device.',
    theme: 'Look',
    unavailable: 'Unavailable',
    unknown: 'unknown',
    updated: 'updated',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Ledger editor',
      subtitle:
        'Paste from anywhere, tweak the cargo list, and stash it local fer now.',
      pasteLabel: 'Paste or write yer ledger',
      pastePlaceholder: 'milk\nbread\napples\ncoffee',
      quickAddLabel: 'Quick-add one bit o’ cargo',
      quickAddPlaceholder: 'e.g. bananas x20',
      sharingTitle: 'Chart sharing',
      sharingSubtitle:
        'Any scallywag with the shared chart can edit this ledger.',
      sharingUnavailable: 'Sharing be ready when the backend be online.',
      parsedTitle: 'Parsed cargo',
      parsedSubtitle:
        'Structured cargo, ready for local stowage today and a proper vault later.',
      parsedEmpty: 'Stash and sort the ledger to generate structured cargo.',
    },
    route: {
      title: 'Store route',
      subtitle:
        'Unfinished decks stay up top. Finished decks sink to the bottom.',
      filterPlaceholder: 'Filter cargo',
      emptyNoItems:
        'Ye need some cargo on the edit page before a store route can be shown.',
      emptyNoResults:
        'Nothin’ to show yet. Head back to edit and add some cargo.',
      viewDefault: 'Default view',
      viewComfortable: 'Comfortable view',
      viewCompact: 'Compact view',
    },
    settings: {
      title: 'Rigging',
      subtitle:
        'Preferences fer how this device shows and groups yer shopping ledgers.',
      countryLabel: 'Waters profile',
      themeLabel: 'Look',
      themeSubtitle: 'Choose the look that sits easiest on yer eyes.',
      localeLabel: 'Tongue',
      localeSubtitle: 'Choose the tongue ye prefer fer the app’s words.',
      routeDensityLabel: 'Route density',
      routeDensitySubtitle:
        'How tight the shopping route be spaced on this device.',
    },
    sections: {
      title: 'Decks',
      subtitle: 'Read-only market grouping fer the chosen waters profile.',
    },
    debug: {
      title: 'Bilge tools',
      subtitle:
        'Self-checks and parser reckonin’ live here instead o’ clutterin’ the main voyage.',
      parsedTitle: 'Parsed cargo',
      parsedSubtitle:
        'Inspect and adjust the structured cargo made from the current ledger.',
      tabParsed: 'Parsed',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Quantities',
      tabWeights: 'Weights',
      tabSections: 'Decks',
      tabStorage: 'Stowage',
      backendTitle: 'Backend checks',
      backendConnected: 'Backend API and hold be available.',
      backendChecking: 'Backend status be gettin’ checked.',
      backendError:
        'Backend answered, but one or more checks went to Davy Jones.',
      backendOffline:
        'Backend be offline; the app be using frontend stowage only.',
      backendHealthTitle: 'Backend health',
      backendHealthExpected: 'GET /api/health returns OK',
      databaseTitle: 'Hold',
      databaseExpected: 'GET /api/database/status can read the backend hold',
      matcherTitle: 'Matcher self-checks',
      matcherSubtitle:
        'Light checks so grouping mishaps be obvious while buildin’.',
      quantityTitle: 'Count quantity self-checks',
      quantitySubtitle:
        'Count-style quantities like x2 and 4 carrots stay tied to one checkable bit o’ cargo.',
      weightTitle: 'Weight and unit self-checks',
      weightSubtitle:
        'Weights and units like 500g or 1.5kg stay tied to the cargo, even with a count.',
      storageTitle: 'Stowage self-checks',
      storageSubtitle:
        'Record data should round-trip clean through local stowage and any future hold.',
      allMatcherPass: 'All matcher checks be passin’.',
      allQuantityPass: 'All count quantity checks be passin’.',
      allWeightPass: 'All weight and unit checks be passin’.',
      allStoragePass: 'All stowage checks be passin’.',
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
    fr: 'Français',
    de: 'Deutsch',
    nl: 'Nederlands',
    it: 'Italiano',
    ro: 'Română',
    pi: 'Pirate',
  },
  themeOptions: {
    system: 'Ship preference',
    light: 'Daylight',
    dark: 'Moonlight',
  },
  mobileMenu: {
    openNavigation: 'Open the nav chart',
  },
  backendStatus: {
    connected: 'Ahoy',
    checking: 'Lookout',
    issue: 'Adrift',
    frontendOnly: 'Adrift',
  },
  sharing: {
    cameraUnavailable: 'Camera access be unavailable on this device.',
    connectBackendFirst: 'Connect the backend afore ye forge a shared chart.',
    createFailed: 'Could not forge the shared chart.',
    emptyList: 'Empty ledger',
    invalidLink: 'Enter a proper shared ledger URL or UUID, matey.',
    loadFailed: 'Could not load that shared ledger.',
    loadMissing: 'That shared ledger does not exist in the backend hold.',
    manualLinkLabel: 'Open a shared ledger',
    manualLinkPlaceholder: 'Paste a shared URL or UUID',
    refreshMissing:
      'This shared ledger does not exist yet. Yer edits will create it.',
    refreshFailed: 'Could not refresh the shared ledger.',
    offlineBackup:
      'Backend be offline. Showin’ the local backup fer this shared ledger.',
    recentListsEmpty: 'No shared ledgers have been opened on this device yet.',
    recentListsTitle: 'Recently opened shared ledgers',
    scannerInstructions: 'Point the camera at a Smart Shopping List QR chart.',
    scannerListMissing: 'That shared ledger does not exist.',
    scannerOpenFailed: 'Could not open the camera fer QR scan duty.',
    scannerReady: 'Shared ledger found. Check the field, then open it.',
    scannerUnsupported:
      'QR scannin’ be unsupported in this browser. Paste the URL or UUID instead.',
  },
  sectionToggle: {
    tickAll: 'Mark all',
    untickAll: 'Unmark all',
  },
};

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

  if (normalizedLanguage.startsWith('es')) return 'es';
  if (normalizedLanguage.startsWith('fr')) return 'fr';
  if (normalizedLanguage.startsWith('de')) return 'de';
  if (normalizedLanguage.startsWith('nl')) return 'nl';
  if (normalizedLanguage.startsWith('it')) return 'it';
  if (normalizedLanguage.startsWith('ro')) return 'ro';
  return 'en';
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

export const getDocumentLocale = (locale: LocaleCode): string =>
  locale === 'en' ? 'en-GB' : locale === 'pi' ? 'en-PI' : locale;

export const applyDocumentLocale = (locale: LocaleCode): void => {
  if (typeof document === 'undefined') return;
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

export type { Messages };
