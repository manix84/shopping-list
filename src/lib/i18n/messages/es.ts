import type { Messages } from '../types';

export const es: Messages = {
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
    offlineTitle: 'Funcionando sin conexión',
    offlineDescription:
      'Sin conexión no significa que esté roto. Puedes seguir usando la app en este dispositivo sin el servidor.',
    offlineSyncDescription:
      'Cuando el backend vuelva a estar disponible, tu lista se sincronizará automáticamente.',
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
