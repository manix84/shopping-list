import type { Messages } from '../types';
import { en } from './en';

export const ro: Messages = {
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
    about: 'Despre',
    debugTools: 'Unelte de depanare',
  },
  actions: {
    ...en.actions,
    add: 'Adaugă',
    backToEdit: 'Înapoi la editare',
    backToSettings: 'Înapoi la setări',
    close: 'Închide',
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
    skipToMainContent: 'Sari la conținutul principal',
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
    countryProfile: 'Profil de aranjare a magazinului',
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
    variant: 'Variantă',
  },
  pages: {
    ...en.pages,
    edit: {
      title: 'Editor listă',
      subtitle:
        'Lipește de oriunde, ajustează lista și salveaz-o local deocamdată.',
      pasteLabel: 'Lipește sau scrie lista',
      pastePlaceholder: 'lapte\npâine\nmere\ncafea',
      countryProfileHint:
        'Alege regulile de aranjare a magazinului folosite pentru sortarea raioanelor și secțiunilor din această țară.',
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
      countryLabel: 'Profil de aranjare a magazinului',
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
    about: {
      tagline: 'Un planificator gratuit al traseului de cumpărături, atent la confidențialitate.',
      versionLabel: 'Versiune',
      authorLabel: 'Creat de',
      authorValue: 'Rob',
      costLabel: 'Cost',
      costValue: 'Gratuit',
      privacyLabel: 'Confidențialitate',
      privacyValue: 'Fără reclame, fără urmărire, stocare locală mai întâi',
      purposeLabel: 'Scop',
      purposeValue:
        'Transformă o listă rapidă de cumpărături într-un traseu ordonat prin magazin',
      bodyIntro:
        'Smart Shopping List există pentru a face o vizită obișnuită la supermarket mai puțin complicată. Lipește sau scrie ce ai nevoie, alege profilul de aranjare a magazinului care se potrivește locului unde cumperi, iar aplicația îți grupează lista într-un traseu pe care îl poți bifa pe parcurs.',
      bodyPrivacy:
        'Acesta este un produs gratuit. Nu există reclame și nici trackere de analiză. Aplicația este concepută să fie utilă fără să transforme obiceiurile tale de cumpărături în setul de date al altcuiva.',
      bodyAuthor:
        'Sunt Rob, un inginer software cu experiență căruia îi place să construiască instrumente practice care respectă oamenii care le folosesc. Acest proiect este intenționat mic, direct și concentrat pe a face bine o sarcină de zi cu zi.',
      sourceAction: 'Vezi sursa',
      sponsorAction: 'Sponsorizează-l pe Rob',
      sponsorFootnote:
        'Sponsorizarea ajută această aplicație să rămână independentă, întreținută și gratuită.',
      authorProfileLabel: 'Deschide profilul GitHub al lui Rob',
    },
    debug: {
      title: 'Unelte de depanare',
      subtitle:
        'Autoverificările și diagnosticele parserului stau aici în loc să aglomereze fluxul principal.',
      parsedTitle: 'Articole analizate',
      parsedSubtitle:
        'Inspectează și ajustează manual articolele structurate generate din lista curentă.',
      tabParsed: 'Analizate',
      tabState: 'Stare',
      tabBackend: 'Backend',
      tabConfig: 'Config',
      tabMatcher: 'Potrivire',
      tabQuantity: 'Cantități',
      tabWeights: 'Greutăți',
      tabVariants: 'Variante',
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
      configTitle: 'Autoverificări profil de țară',
      configSubtitle:
        'Validează structura profilului, acoperirea cuvintelor cheie și secțiunile lor proprietare.',
      matcherTitle: 'Autoverificări de potrivire',
      matcherSubtitle:
        'Verificări ușoare pentru a face regresiile de grupare evidente.',
      quantityTitle: 'Autoverificări de cantități numărate',
      quantitySubtitle:
        'Cantitățile precum x2 și 4 morcovi rămân atașate unui singur articol bifabil.',
      weightTitle: 'Autoverificări de greutăți și unități',
      weightSubtitle:
        'Greutățile și unitățile precum 500g sau 1.5kg rămân atașate articolului, chiar și cu o cantitate.',
      variantTitle: 'Autoverificări de variante',
      variantSubtitle:
        'Aromele, stilurile de lapte și descriptorii similari rămân separate de produsul de bază.',
      storageTitle: 'Autoverificări de stocare',
      storageSubtitle:
        'Datele trebuie să treacă curat prin stocarea locală și orice bază viitoare.',
      stateTitle: 'Autoverificări de stare',
      stateSubtitle:
        'Validează lista curentă cu parserul, potrivirea, variantele, progresul și identitatea listei.',
      allMatcherPass: 'Toate verificările de potrivire trec.',
      allQuantityPass: 'Toate verificările de cantități numărate trec.',
      allWeightPass: 'Toate verificările de greutăți și unități trec.',
      allVariantPass: 'Toate verificările de variante trec.',
      allStoragePass: 'Toate verificările de stocare trec.',
      allStatePass: 'Toate verificările de stare trec.',
      allConfigPass: 'Toate verificările de configurare trec.',
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
  pwaInstall: {
    ...en.pwaInstall,
  },
  backendStatus: {
    connected: 'Online',
    checking: 'Se verifică',
    issue: 'Offline',
    frontendOnly: 'Offline',
    offlineTitle: 'Lucru offline',
    offlineDescription:
      'Offline nu înseamnă că ceva este stricat. Poți continua să folosești aplicația pe acest dispozitiv fără server.',
    offlineSyncDescription:
      'Când backendul devine din nou disponibil, lista se va sincroniza automat.',
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
