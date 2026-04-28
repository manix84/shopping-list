import type { Messages } from '../types';
import { en } from './en';

export const nl: Messages = {
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
    about: 'Over',
    debugTools: 'Debughulpmiddelen',
  },
  actions: {
    ...en.actions,
    add: 'Toevoegen',
    backToEdit: 'Terug naar bewerken',
    backToSettings: 'Terug naar instellingen',
    close: 'Sluiten',
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
    skipToMainContent: 'Naar hoofdinhoud springen',
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
    countryProfile: 'Winkelindelingsprofiel',
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
    variant: 'Variant',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Lijstbewerker',
      subtitle:
        'Plak van overal, pas de lijst aan en sla hem voorlopig lokaal op.',
      pasteLabel: 'Plak of typ je lijst',
      pastePlaceholder: 'melk\nbrood\nappels\nkoffie',
      countryProfileHint:
        'Kies de winkelindelingsregels waarmee gangen en secties voor dit land worden gesorteerd.',
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
      countryLabel: 'Winkelindelingsprofiel',
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
      tabState: 'Status',
      tabBackend: 'Backend',
      tabConfig: 'Config',
      tabMatcher: 'Matcher',
      tabQuantity: 'Hoeveelheden',
      tabWeights: 'Gewichten',
      tabVariants: 'Varianten',
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
      configTitle: 'Landprofiel-zelftests',
      configSubtitle:
        'Controleer profielstructuur, trefwoorddekking en de bijbehorende matcher-secties.',
      matcherTitle: 'Matcher-zelftests',
      matcherSubtitle:
        'Lichte controles zodat regressies in groepering snel zichtbaar zijn.',
      quantityTitle: 'Telhoeveelheids-zelftests',
      quantitySubtitle:
        'Telhoeveelheden zoals x2 en 4 wortels blijven gekoppeld aan één afvinkbaar artikel.',
      weightTitle: 'Gewicht- en eenheid-zelftests',
      weightSubtitle:
        'Gewichten en eenheden zoals 500g of 1.5kg blijven aan het artikel gekoppeld, ook met een telhoeveelheid.',
      variantTitle: 'Variant-zelftests',
      variantSubtitle:
        'Smaken, melksoorten en vergelijkbare omschrijvingen blijven apart van het basisproduct.',
      storageTitle: 'Opslag-zelftests',
      storageSubtitle:
        'Gegevens moeten netjes heen en weer gaan door lokale opslag en latere databases.',
      stateTitle: 'Status-zelftests',
      stateSubtitle:
        'Controleer de huidige lijst tegen parser, matcher, varianten, voortgang en lijstidentiteit.',
      allMatcherPass: 'Alle matcher-controles slagen.',
      allQuantityPass: 'Alle telhoeveelheidscontroles slagen.',
      allWeightPass: 'Alle gewicht- en eenheidcontroles slagen.',
      allVariantPass: 'Alle variantcontroles slagen.',
      allStoragePass: 'Alle opslagcontroles slagen.',
      allStatePass: 'Alle statuscontroles slagen.',
      allConfigPass: 'Alle configcontroles slagen.',
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
    offlineTitle: 'Offline werken',
    offlineDescription:
      'Offline betekent niet dat er iets stuk is. Je kunt de app op dit apparaat blijven gebruiken zonder server.',
    offlineSyncDescription:
      'Wanneer de backend weer bereikbaar is, wordt je lijst automatisch gesynchroniseerd.',
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
