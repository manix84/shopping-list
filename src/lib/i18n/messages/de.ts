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
    countryProfile: 'Ladenlayout-Profil',
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
      countryLabel: 'Ladenlayout-Profil',
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
      tabState: 'Status',
      tabBackend: 'Backend',
      tabConfig: 'Config',
      tabMatcher: 'Matcher',
      tabQuantity: 'Mengen',
      tabWeights: 'Gewichte',
      tabVariants: 'Varianten',
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
      weightTitle: 'Gewichts- und Einheiten-Selbsttests',
      weightSubtitle:
        'Gewichte und Einheiten wie 500g oder 1.5kg bleiben am Artikel hängen, auch wenn eine Zählmenge vorhanden ist.',
      variantTitle: 'Varianten-Selbsttests',
      variantSubtitle:
        'Geschmacksrichtungen, Milchsorten und ähnliche Beschreibungen bleiben vom Basisprodukt getrennt.',
      storageTitle: 'Speicher-Selbsttests',
      storageSubtitle:
        'Daten sollten sauber durch lokalen Speicher und spätere Datenbanken laufen.',
      stateTitle: 'Status-Selbsttests',
      stateSubtitle:
        'Prüft die aktuelle Liste gegen Parser, Matcher, Varianten, Fortschritt und Listenidentität.',
      allMatcherPass: 'Alle Matcher-Prüfungen bestehen.',
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
  themeOptions: {
    system: 'Systemeinstellung',
    light: 'Hell',
    dark: 'Dunkel',
  },
  mobileMenu: {
    openNavigation: 'Navigationsmenü öffnen',
  },
  pwaInstall: {
    ...en.pwaInstall,
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
