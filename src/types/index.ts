export type PageKey = 'edit' | 'route' | 'sections' | 'settings' | 'about' | 'debug';
export type AppRoute = {
  page: PageKey;
  listId?: string;
};
export type CountryCode = 'uk' | 'us' | 'ca';
export type ThemeMode = 'system' | 'light' | 'dark';
export type RouteViewMode = 'default' | 'comfortable' | 'compact';
export type MeasurementUnitSystem = 'metric' | 'us-customary' | 'canadian-customary';
export type MeasurementDisplayMode = 'metric' | 'source';

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
  input: string;
  items: Item[];
  updatedAt: string;
  countryCode: CountryCode;
};

export type AppSettingsRecord = {
  countryCode: CountryCode;
  updatedAt: string;
};

export type SharedListHistoryEntry = {
  listId: string;
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

export type BackendStatus = {
  state: BackendConnectionState;
  health: {
    ok: boolean;
    mode?: string;
  };
  database: {
    ok: boolean;
    settingsExists?: boolean;
    settingsCountryCode?: CountryCode;
    settingsUpdatedAt?: string;
    shoppingListExists?: boolean;
    updatedAt?: string;
    sharedListCount?: number;
  };
};
