import type { CountryConfig, MatcherTestCase, MatcherTestResult, QuantityTestCase, QuantityTestResult } from '../types';
import { extractQuantity } from './quantity';
import { detectSection } from './sections';
import { cleanLine } from './stringUtils';

export const MATCHER_TEST_CASES: MatcherTestCase[] = [
  { input: 'spaghetti', expectedSection: 'pasta' },
  { input: 'fettuccine', expectedSection: 'pasta' },
  { input: 'macaroni', expectedSection: 'pasta' },
  { input: 'ravioli', expectedSection: 'pasta' },
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
];

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
