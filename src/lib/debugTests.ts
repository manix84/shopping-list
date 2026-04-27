import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryConfig, MatcherTestCase, MatcherTestResult, QuantityTestCase, QuantityTestResult, StorageTestResult } from '../types';
import { extractQuantity } from './quantity';
import { detectSection } from './sections';
import { cleanLine } from './stringUtils';
import { parseItems } from './parser';
import { STORAGE_KEY, localStorageRepository } from './repository/localStorageRepository';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './repository/recordCodec';
import { THEME_STORAGE_KEY, loadThemeMode, saveThemeMode } from './themePreference';
import { isUuidV7 } from './uuid';

export const MATCHER_TEST_CASES: MatcherTestCase[] = [
  { input: 'spaghetti', expectedSection: 'pasta' },
  { input: 'fettuccine', expectedSection: 'pasta' },
  { input: 'macaroni', expectedSection: 'pasta' },
  { input: 'ravioli', expectedSection: 'pasta' },
  { input: 'corn flakes', expectedSection: 'cereal' },
  { input: 'weetos', expectedSection: 'cereal' },
  { input: 'crunch clusters', expectedSection: 'cereal' },
  { input: 'porridge oats', expectedSection: 'cereal' },
  { input: 'diet coke', expectedSection: 'drinks' },
  { input: 'cherry pepsi', expectedSection: 'drinks' },
  { input: 'pepsi max', expectedSection: 'drinks' },
  { input: 'cherry pepsi max', expectedSection: 'drinks' },
  { input: 'lime pepsi max', expectedSection: 'drinks' },
  { input: 'pepsi zero', expectedSection: 'drinks' },
  { input: 'mango pepsi zero', expectedSection: 'drinks' },
  { input: 'tropical pepsi zero', expectedSection: 'drinks' },
  { input: 'mango coke zero', expectedSection: 'drinks' },
  { input: 'tropical coke', expectedSection: 'drinks' },
  { input: 'zero sprite', expectedSection: 'drinks' },
  { input: 'baby food', expectedSection: 'baby_food' },
  { input: 'blue milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'gold milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'green milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'red milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'small milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'banana', expectedSection: 'produce' },
  { input: 'bananas', expectedSection: 'produce' },
  { input: 'ice-cream', expectedSection: 'frozen_ice_cream' },
  { input: 'Ice Cream', expectedSection: 'frozen_ice_cream' },
  { input: 'ice lollies', expectedSection: 'frozen_ice_cream' },
  { input: 'frozen summer fruits', expectedSection: 'frozen_fruit' },
  { input: 'frozen blueberries', expectedSection: 'frozen_fruit' },
  { input: 'frozen cherries', expectedSection: 'frozen_fruit' },
  { input: 'chicken nuggets', expectedSection: 'frozen_meals' },
  { input: 'frozen garlic bread', expectedSection: 'frozen_meals' },
  { input: 'single cream', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'large free-range eggs', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'orange juice', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'ham slices', expectedSection: 'chilled_cooked_meat' },
  { input: 'chicken thighs', expectedSection: 'chilled_fresh_meat' },
  { input: 'washing up liquid', expectedSection: 'household' },
  { input: 'cat food', expectedSection: 'pet_supplies' },
  { input: 'paracetamol', expectedSection: 'health_beauty' },
];

export const QUANTITY_TEST_CASES: QuantityTestCase[] = [
  { input: 'bananas x2', expectedName: 'bananas', expectedQuantity: 'x2', expectedQuantityValue: 2 },
  { input: 'milk x 2', expectedName: 'milk', expectedQuantity: 'x2', expectedQuantityValue: 2 },
  { input: '2x apples', expectedName: 'apples', expectedQuantity: 'x2', expectedQuantityValue: 2 },
  { input: '4 carrots', expectedName: 'carrots', expectedQuantity: 'x4', expectedQuantityValue: 4 },
  { input: '500g mince', expectedName: 'mince', expectedQuantity: '500g' },
  { input: '1.5kg potatoes', expectedName: 'potatoes', expectedQuantity: '1.5kg' },
  { input: 'ice-cream', expectedName: 'ice-cream' },
  { input: 'x3 bananas', expectedName: 'bananas', expectedQuantity: 'x3', expectedQuantityValue: 3 },
  { input: '2x 500g bags of rice', expectedName: 'bags of rice', expectedQuantity: 'x2', expectedQuantityValue: 2 },
];

const STORAGE_FIXTURE_INPUT = 'small milk\nbananas x2\n500g mince';
const STORAGE_FIXTURE_RECORD = {
  listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
  serverBacked: true,
  input: STORAGE_FIXTURE_INPUT,
  items: parseItems(STORAGE_FIXTURE_INPUT, COUNTRY_CONFIGS.uk),
  updatedAt: '2026-04-22T00:00:00.000Z',
  countryCode: 'uk' as const,
};

export const runStorageTests = (): StorageTestResult[] => {
  const codecRaw = encodeShoppingListRecord(STORAGE_FIXTURE_RECORD);
  const decoded = decodeShoppingListRecord(codecRaw);
  const codecPassed =
    !!decoded &&
    decoded.input === STORAGE_FIXTURE_RECORD.input &&
    decoded.listId === STORAGE_FIXTURE_RECORD.listId &&
    decoded.serverBacked === true &&
    decoded.countryCode === STORAGE_FIXTURE_RECORD.countryCode &&
    decoded.items.length === STORAGE_FIXTURE_RECORD.items.length &&
    decoded.items[0]?.sizeValue === 'S' &&
    decoded.items[1]?.quantityValue === 2 &&
    decoded.items[2]?.quantity === '500g';

  const results: StorageTestResult[] = [
    {
      title: 'Storage codec round-trip',
      expected: 'Keep list identity, backend status, input, items, country, and derived metadata intact',
      actual: decoded
        ? `list ${decoded.listId ?? 'missing'}, backend ${decoded.serverBacked ? 'yes' : 'no'}, ${decoded.items.length} items`
        : 'decode failed',
      passed: codecPassed,
    },
    {
      title: 'UUIDv7 list identity',
      expected: 'Records carry a share-ready UUIDv7 list id',
      actual: decoded?.listId ?? 'missing',
      passed: isUuidV7(decoded?.listId),
    },
  ];

  if (typeof window === 'undefined') {
    return results;
  }

  const previousTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const previous = window.localStorage.getItem(STORAGE_KEY);

  try {
    saveThemeMode('dark');
    const loadedTheme = loadThemeMode();
    results.push({
      title: 'Theme preference round-trip',
      expected: 'Persist and restore the local theme override only',
      actual: `mode ${loadedTheme}`,
      passed: loadedTheme === 'dark',
    });

    localStorageRepository.save(STORAGE_FIXTURE_RECORD);
    const loaded = localStorageRepository.load();
    const repoPassed =
      loaded.input === STORAGE_FIXTURE_RECORD.input &&
      loaded.listId === STORAGE_FIXTURE_RECORD.listId &&
      loaded.serverBacked === true &&
      loaded.countryCode === STORAGE_FIXTURE_RECORD.countryCode &&
      loaded.items.length === STORAGE_FIXTURE_RECORD.items.length &&
      loaded.items[0]?.sizeValue === 'S' &&
      loaded.items[1]?.quantityValue === 2 &&
      loaded.items[2]?.quantity === '500g';

    results.push({
      title: 'Local storage round-trip',
      expected: 'Persist and restore the full shopping list backup record',
      actual: `list ${loaded.listId ?? 'missing'}, backend ${loaded.serverBacked ? 'yes' : 'no'}, ${loaded.items.length} items`,
      passed: repoPassed,
    });
  } finally {
    if (previousTheme === null) {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, previousTheme);
    }

    if (previous === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, previous);
    }
  }

  return results;
};

export const runMatcherTests = (config: CountryConfig): MatcherTestResult[] =>
  MATCHER_TEST_CASES.map((test) => ({
    ...test,
    actualSection: detectSection(test.input, config),
    passed: detectSection(test.input, config) === test.expectedSection,
  }));

export const runQuantityTests = (): QuantityTestResult[] =>
  QUANTITY_TEST_CASES.map((test) => {
    const actual = extractQuantity(test.input);
    return {
      ...test,
      actualName: cleanLine(actual.name),
      actualQuantity: actual.quantity,
      actualQuantityValue: actual.quantityValue,
      passed:
        cleanLine(actual.name) === test.expectedName &&
        actual.quantity === test.expectedQuantity &&
        actual.quantityValue === test.expectedQuantityValue,
    };
  });
