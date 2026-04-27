import type { Messages } from '../types';
import { en } from './en';

export const fr: Messages = {
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
