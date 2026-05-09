export type PageKey = 'edit' | 'route' | 'sections' | 'settings' | 'about' | 'debug' | 'not-found' | 'server-error';
export type DebugTabKey =
  | 'parsed'
  | 'state'
  | 'backend'
  | 'database-entry'
  | 'config'
  | 'matcher'
  | 'quantity'
  | 'measurements'
  | 'weights'
  | 'variants'
  | 'layout'
  | 'sections'
  | 'storage'
  | 'host'
  | 'events'
  | 'settings';
export type DebugNotificationTestKey = 'minimal' | 'single-item' | 'few-items' | 'large-batch' | 'silent-follow-up';
export type DebugEventTestKey =
  | 'pwa-install-nudge'
  | 'pwa-update-overlay'
  | 'secret-aisle'
  | 'predator'
  | 'toast-success'
  | 'toast-info'
  | 'toast-warning'
  | 'toast-error'
  | 'toast-plain';
export type DebugNotificationDeliveryPath = 'blocked' | 'service-worker' | 'page' | 'failed';
export type DebugNotificationResult = {
  status: 'requesting' | 'blocked' | 'failed' | 'shown';
  kind?: DebugNotificationTestKey;
  deliveryPath?: DebugNotificationDeliveryPath;
  permission?: NotificationPermission | 'unsupported';
  secureContext?: boolean;
  focus?: boolean;
  visibility?: DocumentVisibilityState;
};
export type AppRoute = {
  page: PageKey;
  listId?: string;
  debugTab?: DebugTabKey;
};
export type CountryCode = 'uk' | 'us' | 'ca' | 'fr' | 'de' | 'it' | 'be' | 'es' | 'ro' | 'mx' | 'nl';
export type ThemeMode = 'system' | 'light' | 'dark';
export type RouteViewMode = 'default' | 'comfortable' | 'compact';
export type MeasurementUnitSystem = 'metric' | 'us-customary' | 'canadian-customary';
export type MeasurementDisplayMode = 'metric' | 'imperial' | 'cooking';

export type SectionKey =
  | 'produce'
  | 'bakery_counter'
  | 'butcher_counter'
  | 'fishmonger_counter'
  | 'deli_counter'
  | 'chilled_milk_juice_cream'
  | 'chilled_cooked_meat'
  | 'chilled_fresh_meat'
  | 'chilled_ready_meals'
  | 'frozen_veg'
  | 'frozen_ice_cream'
  | 'frozen_fruit'
  | 'frozen_meals'
  | 'pasta'
  | 'cereal'
  | 'baby_food'
  | 'sauces'
  | 'tinned_jarred'
  | 'home_baking'
  | 'cooking_ingredients'
  | 'hot_drinks'
  | 'seafood_counter'
  | 'pantry'
  | 'snacks'
  | 'drinks'
  | 'alcohol'
  | 'baby'
  | 'clothing'
  | 'household'
  | 'health_beauty'
  | 'electrical'
  | 'pet_supplies'
  | 'seasonal'
  | 'other';

export type Item = {
  id: string;
  raw: string;
  normalized: string;
  cleaned: string;
  checked: boolean;
  size?: string;
  sizeValue?: 'S' | 'M' | 'L';
  quantity?: string;
  quantityDisplay?: string;
  quantityMetricValue?: number;
  quantityMetricUnit?: 'g' | 'ml';
  quantityValue?: number;
  variant?: string;
  matchedSection: SectionKey;
};

export type ShoppingListRecord = {
  listId?: string;
  serverBacked?: boolean;
  listName?: string;
  input: string;
  items: Item[];
  updatedAt: string;
  countryCode: CountryCode;
};

export type SharedListHistoryEntry = {
  listId: string;
  listName?: string;
  itemPreview: string[];
  createdAt?: string;
  updatedAt: string;
  viewedAt: string;
};

export type SectionDef = {
  key: SectionKey;
  label: string;
  keywords: string[];
};

export type SectionGroup = {
  key: string;
  label: string;
  order: number;
  sections: SectionDef[];
};

export type CountryConfig = {
  code: CountryCode;
  flag: string;
  label: string;
  measurement: {
    unitSystem: MeasurementUnitSystem;
    displayMode: MeasurementDisplayMode;
  };
  groups: SectionGroup[];
};

export type ConfigTestResult = {
  title: string;
  expected: string;
  actual: string;
  passed: boolean;
};

export type GroupedSectionView = {
  key: SectionKey;
  label: string;
  order: number;
  groupLabel: string;
  items: Item[];
  complete: boolean;
  checkedCount: number;
};

export type MatcherTestCase = {
  input: string;
  expectedSection: SectionKey;
};

export type CountQuantityTestCase = {
  input: string;
  expectedName: string;
  expectedQuantityValue: number;
};

export type UnitQuantityTestCase = {
  input: string;
  countryCode?: CountryCode;
  expectedName: string;
  expectedQuantity: string;
  expectedQuantityDisplay?: string;
  expectedQuantityValue?: number;
};

export type MeasurementTestCase = {
  input: string;
  countryCode: CountryCode;
  displayMode: MeasurementDisplayMode;
  expectedQuantity: string;
  expectedQuantityDisplay: string;
};

export type VariantTestCase = {
  input: string;
  expectedName: string;
  expectedVariant?: string;
  expectedSection: SectionKey;
};

export type MatcherTestResult = MatcherTestCase & {
  actualSection: SectionKey;
  passed: boolean;
};

export type CountQuantityTestResult = CountQuantityTestCase & {
  actualName: string;
  actualQuantityValue?: number;
  passed: boolean;
};

export type UnitQuantityTestResult = UnitQuantityTestCase & {
  actualName: string;
  actualQuantity?: string;
  actualQuantityDisplay?: string;
  actualQuantityValue?: number;
  passed: boolean;
};

export type MeasurementTestResult = MeasurementTestCase & {
  actualQuantity?: string;
  actualQuantityDisplay?: string;
  actualMetricValue?: number;
  actualMetricUnit?: 'g' | 'ml';
  passed: boolean;
};

export type VariantTestResult = VariantTestCase & {
  actualName: string;
  actualVariant?: string;
  actualSection: SectionKey;
  passed: boolean;
};

export type StorageTestResult = {
  title: string;
  expected: string;
  actual: string;
  passed: boolean;
};

export type StateTestResult = {
  title: string;
  expected: string;
  actual: string;
  passed: boolean;
};

export type BackendConnectionState = 'checking' | 'connected' | 'offline' | 'error';
export type BackendDatabaseAdapter = 'json' | 'postgres';

export type BackendHeartbeatSample = {
  checkedAt: string;
  state: BackendConnectionState;
  healthOk: boolean;
  healthMode?: string;
  healthVersion?: string;
  databaseOk: boolean;
  adapter?: BackendDatabaseAdapter;
  databaseUpdatedAt?: string;
  databaseError?: string;
  databaseErrorCode?: string;
  latencyMs: number;
};
export type SaveStatus = 'idle' | 'saving' | 'syncing' | 'saved' | 'error';

export type DebugSettings = {
  forceLocalStorage: boolean;
  pauseBackendHeartbeat: boolean;
  disableAutoBackendReconnect: boolean;
  showPwaInstallPrompts: boolean;
  disablePwaSplash: boolean;
  disableEasterEggs: boolean;
  verboseConsoleDiagnostics: boolean;
};

export type BackendStatus = {
  state: BackendConnectionState;
  health: {
    ok: boolean;
    mode?: string;
    version?: string;
  };
  database: {
    ok: boolean;
    adapter?: BackendDatabaseAdapter;
    updatedAt?: string;
    error?: string;
    errorCode?: string;
  };
};
