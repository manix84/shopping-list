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
    about: 'Acerca de',
    debugTools: 'Herramientas de depuración',
  },
  actions: {
    add: 'Añadir',
    backToEdit: 'Volver a editar',
    backToSettings: 'Volver a ajustes',
    close: 'Cerrar',
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
    skipToMainContent: 'Saltar al contenido principal',
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
    countryProfile: 'Perfil de distribución de tienda',
    created: 'creada',
    defaultList: 'lista predeterminada',
    done: 'Hecho',
    empty: 'vacía',
    exists: 'existe',
    group: 'Grupo',
    items: 'Artículos',
    keywords: 'Palabras clave',
    locale: 'Idioma',
    measurementMode: 'Modo de medidas',
    measurementModeCooking: 'Medidas de cocina',
    measurementModeImperial: 'Medidas imperiales',
    measurementModeMetric: 'Medidas métricas',
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
    variant: 'Variante',
  },
  pages: {
    edit: {
      title: 'Editor de lista',
      subtitle:
        'Pega desde cualquier sitio, ajusta la lista y guárdala localmente por ahora.',
      pasteLabel: 'Pega o escribe tu lista',
      pastePlaceholder: 'leche\npan\nmanzanas\ncafé',
      countryProfileHint:
        'Elige las reglas de distribución de tienda usadas para ordenar pasillos y secciones en este país.',
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
      countryLabel: 'Perfil de distribución de tienda',
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
    about: {
      tagline: 'Un planificador gratuito de rutas de compra que respeta tu privacidad.',
      versionLabel: 'Versión',
      authorLabel: 'Creado por',
      authorValue: 'Rob',
      costLabel: 'Coste',
      costValue: 'Gratis',
      privacyLabel: 'Privacidad',
      privacyValue: 'Sin anuncios, sin rastreo, almacenamiento local primero',
      purposeLabel: 'Propósito',
      purposeValue:
        'Convertir una lista de la compra rápida en una ruta ordenada por la tienda',
      bodyIntro:
        'Lista de la compra inteligente existe para hacer menos incómoda una compra normal en el supermercado. Pega o escribe lo que necesitas, elige el perfil de distribución de tienda que coincide con donde compras y la app agrupa tu lista en una ruta que puedes ir marcando.',
      bodyPrivacy:
        'Es un producto gratuito. No hay anuncios ni rastreadores analíticos. La app está diseñada para ser útil sin convertir tus hábitos de compra en el conjunto de datos de otra persona.',
      bodyAuthor:
        'Soy Rob, un ingeniero de software con experiencia al que le gusta crear herramientas prácticas que respetan a quienes las usan. Este proyecto es deliberadamente pequeño, directo y centrado en hacer bien una tarea cotidiana.',
      sourceAction: 'Ver código fuente',
      sponsorAction: 'Patrocinar a Rob',
      sponsorFootnote:
        'El patrocinio ayuda a mantener esta app independiente, mantenida y gratuita.',
      authorProfileLabel: 'Abrir el perfil de GitHub de Rob',
    },
    debug: {
      title: 'Herramientas de depuración',
      subtitle:
        'Las comprobaciones y diagnósticos viven aquí en vez de saturar el flujo principal.',
      parsedTitle: 'Artículos procesados',
      parsedSubtitle:
        'Inspecciona y ajusta manualmente los elementos estructurados generados desde la lista actual.',
      tabParsed: 'Procesados',
      tabState: 'Estado',
      tabBackend: 'Backend',
      tabConfig: 'Config',
      tabMatcher: 'Clasificador',
      tabMeasurements: 'Medidas',
      tabQuantity: 'Cantidades',
      tabWeights: 'Pesos',
      tabVariants: 'Variantes',
      tabLayout: 'Diseño',
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
      configTitle: 'Comprobaciones de configuración de país',
      configSubtitle:
        'Valida la estructura del perfil, la cobertura de palabras clave y su sección propietaria.',
      matcherTitle: 'Comprobaciones del clasificador',
      matcherSubtitle:
        'Pruebas ligeras para que las regresiones de agrupación se vean enseguida al construir.',
      quantityTitle: 'Comprobaciones de cantidades contadas',
      quantitySubtitle:
        'Las cantidades como x2 y 4 zanahorias siguen unidas a un solo artículo comprobable.',
      measurementTitle: 'Comprobaciones de medidas',
      measurementSubtitle:
        'El almacenamiento métrico, la visualización de cocina, la imperial y las pistas entre paréntesis deben mantenerse consistentes.',
      weightTitle: 'Comprobaciones de pesos y unidades',
      weightSubtitle:
        'Los pesos y unidades como 500g o 1.5kg siguen unidos al artículo, incluso cuando también hay una cantidad.',
      variantTitle: 'Comprobaciones de variantes',
      variantSubtitle:
        'Sabores, estilos de leche y descriptores parecidos se mantienen separados del producto base.',
      layoutTitle: 'Diseño de tienda actual',
      layoutSubtitle:
        'Inspecciona el perfil de país activo, el orden de ruta, las secciones y la cobertura de palabras clave.',
      storageTitle: 'Comprobaciones de almacenamiento',
      storageSubtitle:
        'Los datos deben redondearse limpiamente a través del almacenamiento local y cualquier futura base de datos.',
      stateTitle: 'Comprobaciones de estado',
      stateSubtitle:
        'Valida la lista actual contra el parser, el clasificador, las variantes, el progreso y la identidad.',
      allMatcherPass: 'Todas las comprobaciones del clasificador pasan.',
      allMeasurementPass: 'Todas las comprobaciones de medidas pasan.',
      allQuantityPass: 'Todas las comprobaciones de cantidades contadas pasan.',
      allWeightPass: 'Todas las comprobaciones de pesos y unidades pasan.',
      allVariantPass: 'Todas las comprobaciones de variantes pasan.',
      allStoragePass: 'Todas las comprobaciones de almacenamiento pasan.',
      allStatePass: 'Todas las comprobaciones de estado pasan.',
      allConfigPass: 'Todas las comprobaciones de configuración pasan.',
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
  pwaInstall: {
    title: 'Instalar la app',
    description: 'Ten tu lista de la compra a un toque en este dispositivo.',
    installAction: 'Instalar',
    dismissAction: 'Ahora no',
    dismissLabel: 'Descartar aviso de instalación',
    settingsTitle: 'Instalar en este dispositivo',
    settingsDescription:
      'Añade Lista de la compra inteligente a la pantalla de inicio para acceder más rápido.',
    unavailableTitle: 'Instalar desde el menú del navegador',
    unavailableDescription:
      'Usa el botón de compartir o el menú del navegador y elige Añadir a pantalla de inicio o Instalar app.',
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
