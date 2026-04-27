import type { Messages } from '../types';
import { en } from './en';

export const it: Messages = {
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
    close: 'Chiudi',
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
    skipToMainContent: 'Vai al contenuto principale',
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
    variant: 'Variante',
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
      tabState: 'Stato',
      tabBackend: 'Backend',
      tabMatcher: 'Matcher',
      tabQuantity: 'Quantità',
      tabWeights: 'Pesi',
      tabVariants: 'Varianti',
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
      variantTitle: 'Autocontrolli varianti',
      variantSubtitle:
        'Gusti, tipi di latte e descrittori simili restano separati dal prodotto base.',
      storageTitle: 'Autocontrolli archiviazione',
      storageSubtitle:
        'I dati devono attraversare correttamente lo storage locale e qualsiasi database futuro.',
      stateTitle: 'Autocontrolli stato',
      stateSubtitle:
        'Convalida la lista corrente contro parser, matcher, varianti, avanzamento e identità lista.',
      allMatcherPass: 'Tutti i controlli matcher sono superati.',
      allQuantityPass: 'Tutti i controlli quantità numeriche sono superati.',
      allWeightPass: 'Tutti i controlli pesi e unità sono superati.',
      allVariantPass: 'Tutti i controlli varianti sono superati.',
      allStoragePass: 'Tutti i controlli archiviazione sono superati.',
      allStatePass: 'Tutti i controlli stato sono superati.',
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
    offlineTitle: 'Uso offline',
    offlineDescription:
      'Offline non significa rotto. Puoi continuare a usare l’app su questo dispositivo senza il server.',
    offlineSyncDescription:
      'Quando il backend sarà di nuovo raggiungibile, la lista verrà sincronizzata automaticamente.',
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
