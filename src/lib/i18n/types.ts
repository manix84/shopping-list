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

export type Messages = {
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
    close: string;
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
    skipToMainContent: string;
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
    variant: string;
  };
  pages: {
    edit: {
      title: string;
      subtitle: string;
      pasteLabel: string;
      pastePlaceholder: string;
      countryProfileHint: string;
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
      tabState: string;
      tabBackend: string;
      tabConfig: string;
      tabMatcher: string;
      tabQuantity: string;
      tabWeights: string;
      tabVariants: string;
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
      configTitle: string;
      configSubtitle: string;
      matcherTitle: string;
      matcherSubtitle: string;
      quantityTitle: string;
      quantitySubtitle: string;
      weightTitle: string;
      weightSubtitle: string;
      variantTitle: string;
      variantSubtitle: string;
      storageTitle: string;
      storageSubtitle: string;
      stateTitle: string;
      stateSubtitle: string;
      allMatcherPass: string;
      allQuantityPass: string;
      allWeightPass: string;
      allVariantPass: string;
      allStoragePass: string;
      allStatePass: string;
      allConfigPass: string;
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
  pwaInstall: {
    title: string;
    description: string;
    installAction: string;
    dismissAction: string;
    dismissLabel: string;
    settingsTitle: string;
    settingsDescription: string;
    unavailableTitle: string;
    unavailableDescription: string;
  };
  backendStatus: {
    connected: string;
    checking: string;
    issue: string;
    frontendOnly: string;
    offlineTitle: string;
    offlineDescription: string;
    offlineSyncDescription: string;
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
