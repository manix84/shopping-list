import { COUNTRY_CONFIGS } from '../config/countries';
import type {
  ConfigTestResult,
  CountQuantityTestCase,
  CountQuantityTestResult,
  CountryCode,
  CountryConfig,
  Item,
  MatcherTestCase,
  MatcherTestResult,
  StateTestResult,
  StorageTestResult,
  UnitQuantityTestCase,
  UnitQuantityTestResult,
  VariantTestCase,
  VariantTestResult,
} from '../types';
import { extractQuantifiedItem } from './quantity';
import { detectSection } from './sections';
import { cleanEntryName, cleanLine, normalize } from './stringUtils';
import { dedupeKey, getStoredValue, parseItems } from './parser';
import { STORAGE_KEY, localStorageRepository } from './repository/localStorageRepository';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './repository/recordCodec';
import { THEME_STORAGE_KEY, loadThemeMode, saveThemeMode } from './themePreference';
import { isUuidV7 } from './uuid';

export const MATCHER_TEST_CASES: MatcherTestCase[] = [
  { input: 'spaghetti', expectedSection: 'pasta' },
  { input: 'fettuccine', expectedSection: 'pasta' },
  { input: 'linguini', expectedSection: 'pasta' },
  { input: 'macaroni', expectedSection: 'pasta' },
  { input: 'ravioli', expectedSection: 'pasta' },
  { input: 'corn flakes', expectedSection: 'cereal' },
  { input: 'weetos', expectedSection: 'cereal' },
  { input: 'crunch clusters', expectedSection: 'cereal' },
  { input: 'porridge oats', expectedSection: 'cereal' },
  { input: 'crisps', expectedSection: 'snacks' },
  { input: 'chocolate bars', expectedSection: 'snacks' },
  { input: 'baked beans', expectedSection: 'tinned_jarred' },
  { input: 'tinned tomatoes', expectedSection: 'tinned_jarred' },
  { input: 'soy sauce', expectedSection: 'cooking_ingredients' },
  { input: 'fajita kit', expectedSection: 'cooking_ingredients' },
  { input: 'tea bags', expectedSection: 'hot_drinks' },
  { input: 'coffee pods', expectedSection: 'hot_drinks' },
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
  { input: 'jack daniels', expectedSection: 'alcohol' },
  { input: 'whisky', expectedSection: 'alcohol' },
  { input: 'kopparberg strawberry and lime', expectedSection: 'alcohol' },
  { input: 'rekorderlig wild berries', expectedSection: 'alcohol' },
  { input: 'kopparberg lemon vodka', expectedSection: 'alcohol' },
  { input: 'baby food', expectedSection: 'baby_food' },
  { input: 'blue milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'gold milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'green milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'red milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'small milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'milk', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'banana', expectedSection: 'produce' },
  { input: 'bananas', expectedSection: 'produce' },
  { input: 'tomatoes', expectedSection: 'produce' },
  { input: 'stir-fry mix', expectedSection: 'produce' },
  { input: 'ice-cream', expectedSection: 'frozen_ice_cream' },
  { input: 'Ice Cream', expectedSection: 'frozen_ice_cream' },
  { input: 'ice lollies', expectedSection: 'frozen_ice_cream' },
  { input: 'frozen summer fruits', expectedSection: 'frozen_fruit' },
  { input: 'frozen blueberries', expectedSection: 'frozen_fruit' },
  { input: 'frozen cherries', expectedSection: 'frozen_fruit' },
  { input: 'chicken nuggets', expectedSection: 'frozen_meals' },
  { input: 'frozen garlic bread', expectedSection: 'frozen_meals' },
  { input: 'single cream', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'large free-range eggs', expectedSection: 'home_baking' },
  { input: 'orange juice', expectedSection: 'chilled_milk_juice_cream' },
  { input: 'ham slices', expectedSection: 'chilled_cooked_meat' },
  { input: 'chicken thighs', expectedSection: 'chilled_fresh_meat' },
  { input: 'washing up liquid', expectedSection: 'household' },
  { input: 'laundry detergent', expectedSection: 'household' },
  { input: 'nappies', expectedSection: 'baby' },
  { input: 'cat food', expectedSection: 'pet_supplies' },
  { input: 'paracetamol', expectedSection: 'health_beauty' },
  { input: 'stationery', expectedSection: 'seasonal' },
];

export const COUNT_QUANTITY_TEST_CASES: CountQuantityTestCase[] = [
  { input: 'bananas x2', expectedName: 'bananas', expectedQuantityValue: 2 },
  { input: 'milk x 2', expectedName: 'milk', expectedQuantityValue: 2 },
  { input: '2x apples', expectedName: 'apples', expectedQuantityValue: 2 },
  { input: '4 carrots', expectedName: 'carrots', expectedQuantityValue: 4 },
  { input: 'x3 bananas', expectedName: 'bananas', expectedQuantityValue: 3 },
  { input: '2x 500g bags of rice', expectedName: 'bags of rice', expectedQuantityValue: 2 },
];

export const UNIT_QUANTITY_TEST_CASES: UnitQuantityTestCase[] = [
  { input: '500g mince', expectedName: 'mince', expectedQuantity: '500g' },
  { input: '1.5kg potatoes', expectedName: 'potatoes', expectedQuantity: '1.5kg' },
  { input: 'olive oil 750ml', expectedName: 'olive oil', expectedQuantity: '750ml' },
  { input: '2x 500g bags of rice', expectedName: 'bags of rice', expectedQuantity: '500g', expectedQuantityValue: 2 },
];

export const VARIANT_TEST_CASES: VariantTestCase[] = [
  {
    input: 'strawberry ice-cream',
    expectedName: 'ice cream',
    expectedVariant: 'strawberry',
    expectedSection: 'frozen_ice_cream',
  },
  {
    input: 'lemon and lime ice cream',
    expectedName: 'ice cream',
    expectedVariant: 'lemon and lime',
    expectedSection: 'frozen_ice_cream',
  },
  {
    input: 'strawberry & banana yogurt',
    expectedName: 'yogurt',
    expectedVariant: 'strawberry and banana',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'semi-skimmed milk',
    expectedName: 'milk',
    expectedVariant: 'semi skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'whole milk',
    expectedName: 'milk',
    expectedVariant: 'whole',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'skimmed milk',
    expectedName: 'milk',
    expectedVariant: 'skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'gold milk',
    expectedName: 'milk',
    expectedVariant: 'semi skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'green milk',
    expectedName: 'milk',
    expectedVariant: 'semi skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'blue milk',
    expectedName: 'milk',
    expectedVariant: 'whole',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'red milk',
    expectedName: 'milk',
    expectedVariant: 'skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'soy milk',
    expectedName: 'milk',
    expectedVariant: 'soy',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'oat milk',
    expectedName: 'milk',
    expectedVariant: 'oat',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'single cream',
    expectedName: 'cream',
    expectedVariant: 'single',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'double cream',
    expectedName: 'cream',
    expectedVariant: 'double',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'whipping cream',
    expectedName: 'cream',
    expectedVariant: 'whipping',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'whipped cream',
    expectedName: 'whipped cream',
    expectedSection: 'chilled_milk_juice_cream',
  },
  {
    input: 'pepsi max cherry',
    expectedName: 'pepsi max',
    expectedVariant: 'cherry',
    expectedSection: 'drinks',
  },
  {
    input: 'cherry pepsi max',
    expectedName: 'pepsi max',
    expectedVariant: 'cherry',
    expectedSection: 'drinks',
  },
  {
    input: 'mango coke zero',
    expectedName: 'coke zero',
    expectedVariant: 'mango',
    expectedSection: 'drinks',
  },
  {
    input: 'kopparberg pear cider',
    expectedName: 'kopparberg cider',
    expectedVariant: 'pear',
    expectedSection: 'alcohol',
  },
  {
    input: 'kopparberg strawberry and lime',
    expectedName: 'kopparberg cider',
    expectedVariant: 'strawberry and lime',
    expectedSection: 'alcohol',
  },
  {
    input: 'rekorderlig wild berries',
    expectedName: 'rekorderlig cider',
    expectedVariant: 'wild berries',
    expectedSection: 'alcohol',
  },
  {
    input: 'kopparberg lemon vodka',
    expectedName: 'kopparberg vodka',
    expectedVariant: 'lemon',
    expectedSection: 'alcohol',
  },
  {
    input: 'jack daniels honey',
    expectedName: 'jack daniels',
    expectedVariant: 'honey',
    expectedSection: 'alcohol',
  },
  {
    input: 'milk',
    expectedName: 'milk',
    expectedVariant: 'semi skimmed',
    expectedSection: 'chilled_milk_juice_cream',
  },
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

type RunStateTestsInput = {
  input: string;
  items: Item[];
  config: CountryConfig;
  countryCode: CountryCode;
  activeListId: string;
  isServerBackedList: boolean;
  checkedTotal: number;
};

const itemStateKey = (item: Item): string =>
  dedupeKey(item.raw, item.quantity, item.size, item.quantityValue, item.variant);

const duplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      repeated.add(value);
    } else {
      seen.add(value);
    }
  }

  return [...repeated].sort();
};

export const runConfigTests = (config: CountryConfig): ConfigTestResult[] => {
  const sections = config.groups.flatMap((group) =>
    group.sections.map((section) => ({
      ...section,
      groupKey: group.key,
      groupLabel: group.label,
    })),
  );
  const emptyGroups = config.groups.filter((group) => group.sections.length === 0);
  const emptySections = sections.filter((section) => section.keywords.length === 0);
  const missingLabels = [
    ...config.groups.filter((group) => !cleanLine(group.label)).map((group) => group.key),
    ...sections.filter((section) => !cleanLine(section.label)).map((section) => section.key),
  ];
  const invalidKeywords = sections.flatMap((section) =>
    section.keywords
      .filter((keyword) => !cleanEntryName(keyword))
      .map((keyword) => `${section.key}: ${String(keyword)}`),
  );
  const sectionKeyDuplicates = duplicates(sections.map((section) => section.key));
  const groupKeyDuplicates = duplicates(config.groups.map((group) => group.key));
  const groupOrderDuplicates = duplicates(config.groups.map((group) => String(group.order)));
  const keywordCount = sections.reduce((total, section) => total + section.keywords.length, 0);

  return [
    {
      title: 'Country config shape',
      expected: 'Country profile has labelled groups and sections',
      actual: `${config.groups.length} groups, ${sections.length} sections, ${missingLabels.length} missing labels`,
      passed: config.groups.length > 0 && sections.length > 0 && missingLabels.length === 0,
    },
    {
      title: 'Unique group ordering',
      expected: 'Group keys and route orders are unique',
      actual: `${groupKeyDuplicates.length} duplicate group keys, ${groupOrderDuplicates.length} duplicate group orders`,
      passed: groupKeyDuplicates.length === 0 && groupOrderDuplicates.length === 0,
    },
    {
      title: 'Unique section keys',
      expected: 'Each section key appears once in this country profile',
      actual: sectionKeyDuplicates.length === 0 ? `${sections.length} unique sections` : sectionKeyDuplicates.join(', '),
      passed: sectionKeyDuplicates.length === 0,
    },
    {
      title: 'Keyword coverage',
      expected: 'Every group has sections and every section has keywords',
      actual: `${emptyGroups.length} empty groups, ${emptySections.length} empty sections`,
      passed: emptyGroups.length === 0 && emptySections.length === 0,
    },
    {
      title: 'Keyword text',
      expected: 'Every keyword normalizes to searchable text',
      actual: invalidKeywords.length === 0 ? 'All keywords are searchable' : invalidKeywords.slice(0, 5).join(', '),
      passed: invalidKeywords.length === 0,
    },
    {
      title: 'Keyword volume',
      expected: 'Country profile has enough keywords to cover every section',
      actual: `${keywordCount} keywords across ${sections.length} sections`,
      passed: keywordCount >= sections.length,
    },
  ];
};

export const runStateTests = ({
  input,
  items,
  config,
  countryCode,
  activeListId,
  isServerBackedList,
  checkedTotal,
}: RunStateTestsInput): StateTestResult[] => {
  const reparsedItems = parseItems(input, config, items);
  const currentKeys = items.map(itemStateKey).sort();
  const reparsedKeys = reparsedItems.map(itemStateKey).sort();
  const uniqueIds = new Set(items.map((item) => item.id));
  const checkedItems = items.filter((item) => item.checked).length;
  const duplicateKeys = items.length - new Set(currentKeys).size;
  const malformedItems = items.filter(
    (item) => !item.id || !cleanLine(item.raw) || !cleanEntryName(item.raw) || !normalize(item.matchedSection),
  );
  const sectionMismatches = items.filter((item) => item.matchedSection !== detectSection(item.raw, config));
  const variantItems = items.filter((item) => item.variant);
  const malformedVariants = variantItems.filter(
    (item) => !cleanLine(item.variant) || !cleanLine(item.raw) || !getStoredValue(item).includes(item.variant ?? ''),
  );
  const listIdentityPassed = isServerBackedList ? isUuidV7(activeListId) : cleanLine(activeListId).length > 0;

  return [
    {
      title: 'Parser state parity',
      expected: 'Current parsed items match a fresh parse of the editor input',
      actual:
        currentKeys.join('\n') === reparsedKeys.join('\n')
          ? `${items.length} items match`
          : `${items.length} current, ${reparsedItems.length} reparsed`,
      passed: currentKeys.join('\n') === reparsedKeys.join('\n'),
    },
    {
      title: 'Unique item identity',
      expected: 'Each parsed item has a stable unique id and dedupe key',
      actual: `${uniqueIds.size}/${items.length} unique ids, ${duplicateKeys} duplicate keys`,
      passed: uniqueIds.size === items.length && duplicateKeys === 0,
    },
    {
      title: 'Required item metadata',
      expected: 'Every item has raw, cleaned, and matched section metadata',
      actual: malformedItems.length === 0 ? `${items.length} items complete` : `${malformedItems.length} incomplete items`,
      passed: malformedItems.length === 0,
    },
    {
      title: 'Section assignments',
      expected: 'Stored section matches the current country profile matcher',
      actual:
        sectionMismatches.length === 0
          ? `${items.length} sections match`
          : `${sectionMismatches.length} section mismatches`,
      passed: sectionMismatches.length === 0,
    },
    {
      title: 'Variant metadata',
      expected: 'Variants stay separate from the base product and round-trip into stored text',
      actual:
        malformedVariants.length === 0
          ? `${variantItems.length} variant items valid`
          : `${malformedVariants.length} variant items invalid`,
      passed: malformedVariants.length === 0,
    },
    {
      title: 'Progress counters',
      expected: 'Checked count is derived from the current parsed items',
      actual: `${checkedItems}/${items.length} checked, ${checkedTotal} displayed`,
      passed: checkedItems === checkedTotal && checkedTotal <= items.length,
    },
    {
      title: 'Country profile',
      expected: 'Selected country code and active config agree',
      actual: `${countryCode} selected, ${config.code} config`,
      passed: countryCode === config.code,
    },
    {
      title: 'List identity',
      expected: isServerBackedList ? 'Shared lists use a UUIDv7 identity' : 'Local lists still keep an identity',
      actual: activeListId || 'missing',
      passed: listIdentityPassed,
    },
  ];
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

export const runCountQuantityTests = (): CountQuantityTestResult[] =>
  COUNT_QUANTITY_TEST_CASES.map((test) => {
    const actual = extractQuantifiedItem(test.input);
    return {
      ...test,
      actualName: cleanLine(actual.name),
      actualQuantityValue: actual.quantityValue,
      passed:
        cleanLine(actual.name) === test.expectedName &&
        actual.quantityValue === test.expectedQuantityValue,
    };
  });

export const runUnitQuantityTests = (): UnitQuantityTestResult[] =>
  UNIT_QUANTITY_TEST_CASES.map((test) => {
    const actual = extractQuantifiedItem(test.input);
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

export const runVariantTests = (config: CountryConfig): VariantTestResult[] =>
  VARIANT_TEST_CASES.map((test) => {
    const [actual] = parseItems(test.input, config);
    return {
      ...test,
      actualName: actual?.raw ?? '',
      actualVariant: actual?.variant,
      actualSection: actual?.matchedSection ?? 'other',
      passed:
        actual?.raw === test.expectedName &&
        actual?.variant === test.expectedVariant &&
        actual?.matchedSection === test.expectedSection,
    };
  });
