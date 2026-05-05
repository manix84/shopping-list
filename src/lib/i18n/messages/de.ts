import type { Messages } from '../types';
import { en } from './en';

export const de: Messages = {
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
    about: 'Info',
    debugTools: 'Debug-Werkzeuge',
  },
  actions: {
    ...en.actions,
    add: 'Hinzufügen',
    backToEdit: 'Zurück zur Bearbeitung',
    backToSettings: 'Zurück zu Einstellungen',
    close: 'Schließen',
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
    skipToMainContent: 'Zum Hauptinhalt springen',
    resetTicks: 'Häkchen zurücksetzen',
    revealQrCode: 'QR-Code anzeigen',
    resortFromList: 'Aus Liste neu sortieren',
    saveAndRoute: 'Speichern und Route anzeigen',
    saveAndSort: 'Liste speichern',
    saveAndStay: 'Speichern und hier bleiben',
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
    countryProfile: 'Ladenlayout-Profil',
    created: 'erstellt',
    defaultList: 'Standardliste',
    done: 'Erledigt',
    empty: 'leer',
    exists: 'vorhanden',
    group: 'Gruppe',
    items: 'Artikel',
    keywords: 'Keywords',
    locale: 'Sprache',
    measurementMode: 'Messmodus',
    measurementModeCooking: 'Kochmaße',
    measurementModeImperial: 'Imperiale Maße',
    measurementModeMetric: 'Metrische Maße',
    mode: 'Modus',
    order: 'Reihenfolge',
    progress: 'Fortschritt',
    qty: 'Menge',
    routeOrder: 'Routenreihenfolge',
    saveFailed: 'Speichern fehlgeschlagen',
    saved: 'Gespeichert',
    saving: 'Speichern',
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
    variant: 'Variante',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Listeneditor',
      subtitle:
        'Füge Inhalte aus beliebigen Quellen ein, passe die Liste an und speichere sie vorerst lokal.',
      pasteLabel: 'Liste einfügen oder eingeben',
      pastePlaceholder: 'milch\nbrot\näpfel\nkaffee',
      countryProfileHint:
        'Wähle die Ladenlayout-Regeln, nach denen Gänge und Bereiche für dieses Land sortiert werden.',
      quickAddLabel: 'Schnell einen Artikel hinzufügen',
      quickAddPlaceholder: 'z. B. bananen x20',
      listNameLabel: 'List name (optional)',
      listNamePlaceholder: 'e.g. Weekly shop',
      listNameHint: 'Leave this blank to identify the list by its foods.',
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
      resetTicksConfirmTitle: 'Reset all ticks?',
      resetTicksConfirmBody:
        'This will uncheck all checked items in this list. Your items will stay on the list.',
      resetTicksConfirmAction: 'Reset all ticks',
      viewDefault: 'Standardansicht',
      viewComfortable: 'Komfortable Ansicht',
      viewCompact: 'Kompakte Ansicht',
    },
    settings: {
      title: 'Einstellungen',
      subtitle:
        'Voreinstellungen dafür, wie dieses Gerät Einkaufslisten darstellt und gruppiert.',
      countryLabel: 'Ladenlayout-Profil',
      defaultCountryLabel: 'Standard-Ladenlayout-Profil',
      defaultCountrySubtitle: 'Wird für neue Listen auf diesem Gerät verwendet.',
      defaultCountryAutoDetect: 'Automatisch erkennen',
      detectedCountrySuffix: 'erkannt',
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
    about: {
      tagline: 'Ein kostenloser, datenschutzbewusster Einkaufsroutenplaner.',
      versionLabel: 'Version',
      authorLabel: 'Erstellt von',
      authorValue: 'Rob',
      costLabel: 'Kosten',
      costValue: 'Kostenlos',
      privacyLabel: 'Datenschutz',
      privacyValue: 'Keine Werbung, kein Tracking, lokaler Speicher zuerst',
      purposeLabel: 'Zweck',
      purposeValue:
        'Verwandelt eine grobe Einkaufsliste in eine geordnete Route durch den Laden',
      bodyIntro:
        'Smart Shopping List soll einen normalen Supermarkteinkauf weniger umständlich machen. Füge ein, was du brauchst, wähle das Ladenlayout-Profil, das zu deinem Geschäft passt, und die App gruppiert deine Liste zu einer Route, die du unterwegs abhaken kannst.',
      bodyPrivacy:
        'Dies ist ein kostenloses Produkt. Es gibt keine Werbung und keine Analytics-Tracker. Die App soll nützlich sein, ohne deine Einkaufsgewohnheiten in den Datensatz anderer Leute zu verwandeln.',
      bodyAuthor:
        'Ich bin Rob, ein erfahrener Softwareentwickler, der gerne praktische Werkzeuge baut, die die Menschen respektieren, die sie nutzen. Dieses Projekt ist bewusst klein, direkt und darauf fokussiert, eine alltägliche Aufgabe gut zu erledigen.',
      sourceAction: 'Quellcode ansehen',
      sponsorAction: 'Rob unterstützen',
      sponsorFootnote:
        'Sponsoring hilft, diese App unabhängig, gepflegt und kostenlos nutzbar zu halten.',
      authorProfileLabel: 'Robs GitHub-Profil öffnen',
    },
    error: {
      notFoundCode: '404',
      notFoundEyebrow: 'Gang nicht gefunden',
      notFoundTitle: 'Dieser Gang ist nicht auf dem Ladenplan.',
      notFoundSubtitle:
        'Die geöffnete Route passt zu keiner Einkaufslistenseite. Der Rest der Liste ist bereit, sobald du es bist.',
      serverCode: '500',
      serverEyebrow: 'Kasse blockiert',
      serverTitle: 'Hinter der Theke ist etwas schiefgelaufen.',
      serverSubtitle:
        'Die App ist auf ein Serverproblem gestoßen. Lokales Bearbeiten der Liste sollte weiter funktionieren, und die Debug-Werkzeuge können den Backend-Status prüfen.',
    },
    debug: {
      title: 'Debug-Werkzeuge',
      subtitle:
        'Selbsttests und Parserdiagnosen liegen hier statt im Hauptablauf.',
      parsedTitle: 'Analysierte Artikel',
      parsedSubtitle:
        'Prüfe und passe die strukturierten Artikel aus der aktuellen Liste manuell an.',
      tabParsed: 'Analysiert',
      tabState: 'Status',
      tabBackend: 'Backend',
      tabConfig: 'Config',
      tabMatcher: 'Matcher',
      tabMeasurements: 'Maße',
      tabQuantity: 'Mengen',
      tabWeights: 'Gewichte',
      tabVariants: 'Varianten',
      tabLayout: 'Layout',
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
      configTitle: 'Länderprofil-Selbsttests',
      configSubtitle:
        'Prüft Profilstruktur, Keyword-Abdeckung und die zugehörigen Matcher-Bereiche.',
      matcherTitle: 'Matcher-Selbsttests',
      matcherSubtitle:
        'Leichte Prüfungen, damit Gruppierungsfehler sofort sichtbar werden.',
      quantityTitle: 'Zählmengen-Selbsttests',
      quantitySubtitle:
        'Zählmengen wie x2 und 4 Karotten bleiben an einem abhackbaren Artikel hängen.',
      measurementTitle: 'Maße-Selbsttests',
      measurementSubtitle:
        'Metrische Speicherung, Kochanzeige, imperiale Anzeige und Hinweise in Klammern müssen konsistent bleiben.',
      weightTitle: 'Gewichts- und Einheiten-Selbsttests',
      weightSubtitle:
        'Gewichte und Einheiten wie 500g oder 1.5kg bleiben am Artikel hängen, auch wenn eine Zählmenge vorhanden ist.',
      variantTitle: 'Varianten-Selbsttests',
      variantSubtitle:
        'Geschmacksrichtungen, Milchsorten und ähnliche Beschreibungen bleiben vom Basisprodukt getrennt.',
      layoutTitle: 'Aktuelles Ladenlayout',
      layoutSubtitle:
        'Prüft aktives Länderprofil, Routenreihenfolge, Bereichszuordnung und Keyword-Abdeckung.',
      storageTitle: 'Speicher-Selbsttests',
      storageSubtitle:
        'Daten sollten sauber durch lokalen Speicher und spätere Datenbanken laufen.',
      stateTitle: 'Status-Selbsttests',
      stateSubtitle:
        'Prüft die aktuelle Liste gegen Parser, Matcher, Varianten, Fortschritt und Listenidentität.',
      allMatcherPass: 'Alle Matcher-Prüfungen bestehen.',
      allMeasurementPass: 'Alle Maße-Prüfungen bestehen.',
      allQuantityPass: 'Alle Zählmengen-Prüfungen bestehen.',
      allWeightPass: 'Alle Gewichts- und Einheiten-Prüfungen bestehen.',
      allVariantPass: 'Alle Varianten-Prüfungen bestehen.',
      allStoragePass: 'Alle Speicher-Prüfungen bestehen.',
      allStatePass: 'Alle Status-Prüfungen bestehen.',
      allConfigPass: 'Alle Config-Prüfungen bestehen.',
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
  countryOptions: {
    be: 'Belgien',
    ca: 'Kanada',
    de: 'Deutschland',
    es: 'Spanien',
    fr: 'Frankreich',
    it: 'Italien',
    mx: 'Mexiko',
    nl: 'Niederlande',
    ro: 'Rumänien',
    uk: 'Vereinigtes Königreich',
    us: 'Vereinigte Staaten',
  },
  themeOptions: {
    system: 'Systemeinstellung',
    light: 'Hell',
    dark: 'Dunkel',
  },
  mobileMenu: {
    closeNavigation: 'Navigationsmenü schließen',
    openNavigation: 'Navigationsmenü öffnen',
  },
  easterEgg: {
    title: 'Geheimer Gang freigeschaltet',
    body: 'Du hast die ruhige Ecke des Ladens gefunden. Hier ist alles perfekt sortiert.',
    dismiss: 'Geheimen Gang schließen',
    replay: 'Melodie des geheimen Gangs erneut abspielen',
    harpStringsLabel: 'Harfensaiten',
    harpStringLabel: 'Saite {note}, Taste {key}',
  },
  pwaInstall: {
    title: 'App installieren',
    description: 'Halte deine Einkaufsliste auf diesem Gerät griffbereit.',
    installAction: 'Installieren',
    dismissAction: 'Nicht jetzt',
    dismissLabel: 'Installationshinweis ausblenden',
    settingsTitle: 'Auf diesem Gerät installieren',
    settingsDescription:
      'Füge Smart Shopping List zum Startbildschirm hinzu, um schneller darauf zuzugreifen.',
    unavailableTitle: 'Über das Browsermenü installieren',
    unavailableDescription:
      'Nutze die Teilen-Funktion oder das Browsermenü und wähle Zum Startbildschirm hinzufügen oder App installieren.',
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Prüfung',
    issue: 'Offline',
    frontendOnly: 'Offline',
    offlineTitle: 'Offline arbeiten',
    offlineDescription:
      'Offline heißt nicht kaputt. Du kannst die App auf diesem Gerät weiter ohne Server verwenden.',
    offlineSyncDescription:
      'Wenn das Backend wieder erreichbar ist, wird deine Liste automatisch synchronisiert.',
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
