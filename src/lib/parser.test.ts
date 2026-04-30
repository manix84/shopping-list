import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from '../config/countries/uk';
import {
  getDisplayValue,
  getQuantityDisplayValue,
  getQuantityValue,
  getSizeDisplayValue,
  getSizeValue,
  getStoredValue,
  getUnitQuantityDisplayValue,
  getUnitQuantityValue,
  getVariantDisplayValue,
  getVariantPrefixedDisplayValue,
  getVariantValue,
  parseItems,
} from './parser';

describe('parser', () => {
  it('ignores empty split entries and dedupes equivalent items', () => {
    const items = parseItems('bananas, bananas; - bananas\n\n', UK_CONFIG);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      raw: 'bananas',
      cleaned: 'banana',
      matchedSection: 'produce',
      checked: false,
    });
  });

  it('falls back cleanly for non-string input', () => {
    expect(parseItems(undefined, UK_CONFIG)).toEqual([]);
    expect(parseItems(42, UK_CONFIG)).toEqual([]);
  });

  it('parses quantity, size, and display metadata together', () => {
    const items = parseItems('small milk\nbananas x2\n500g mince', UK_CONFIG);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      raw: 'milk',
      variant: 'semi skimmed',
      size: 'small',
      sizeValue: 'S',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(getSizeDisplayValue(items[0])).toBe('Size: S');
    expect(getSizeValue(items[0])).toBe('S');
    expect(getDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getVariantPrefixedDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getStoredValue(items[0])).toBe('small semi skimmed milk');

    expect(items[1]).toMatchObject({
      raw: 'bananas',
      quantityValue: 2,
      matchedSection: 'produce',
    });
    expect(getQuantityDisplayValue(items[1])).toBe('Qty: 2');
    expect(getQuantityValue(items[1])).toBe('2');
    expect(getUnitQuantityDisplayValue(items[1])).toBeUndefined();
    expect(getDisplayValue(items[1])).toBe('Bananas');
    expect(getStoredValue(items[1])).toBe('x2 bananas');

    expect(items[2]).toMatchObject({
      raw: 'mince',
      quantity: '500g',
      matchedSection: 'chilled_fresh_meat',
    });
    expect(getQuantityDisplayValue(items[2])).toBeUndefined();
    expect(getQuantityValue(items[2])).toBeUndefined();
    expect(getUnitQuantityDisplayValue(items[2])).toBe('500g');
    expect(getUnitQuantityValue(items[2])).toBe('500g');
  });

  it('parses trailing weight quantities into badges instead of the item name', () => {
    const items = parseItems('Chicken Thighs 500g', UK_CONFIG);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      raw: 'chicken thighs',
      quantity: '500g',
    });
    expect(getDisplayValue(items[0])).toBe('Chicken Thighs');
    expect(getQuantityDisplayValue(items[0])).toBeUndefined();
    expect(getQuantityValue(items[0])).toBeUndefined();
    expect(getUnitQuantityDisplayValue(items[0])).toBe('500g');
  });

  it('parses count and weight together and unwraps container names', () => {
    const items = parseItems('2x 500g bags of basmati rice', UK_CONFIG);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      raw: 'basmati rice',
      quantity: '500g',
      quantityValue: 2,
      matchedSection: 'pantry',
    });
    expect(getDisplayValue(items[0])).toBe('Basmati Rice');
    expect(getQuantityDisplayValue(items[0])).toBe('Qty: 2');
    expect(getUnitQuantityDisplayValue(items[0])).toBe('500g');
    expect(getStoredValue(items[0])).toBe('x2 basmati rice 500g');
  });

  it('parses leading product variants from known section keywords', () => {
    const items = parseItems('strawberry ice-cream\nlemon and lime ice cream\nstrawberry & banana yogurt', UK_CONFIG);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      raw: 'ice cream',
      variant: 'strawberry',
      matchedSection: 'frozen_ice_cream',
    });
    expect(getDisplayValue(items[0])).toBe('Ice Cream');
    expect(getVariantDisplayValue(items[0])).toBe('Variant: Strawberry');
    expect(getVariantValue(items[0])).toBe('Strawberry');
    expect(getStoredValue(items[0])).toBe('strawberry ice cream');

    expect(items[1]).toMatchObject({
      raw: 'ice cream',
      variant: 'lemon and lime',
      matchedSection: 'frozen_ice_cream',
    });
    expect(getVariantValue(items[1])).toBe('Lemon and Lime');

    expect(items[2]).toMatchObject({
      raw: 'yogurt',
      variant: 'strawberry and banana',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(getVariantValue(items[2])).toBe('Strawberry and Banana');
  });

  it('parses milk styles as variants of milk', () => {
    const items = parseItems('milk\nwhole milk\nskimmed milk\ngold milk\ngreen milk\nblue milk\nred milk\nsoy milk\noat milk', UK_CONFIG);

    expect(items).toHaveLength(5);
    expect(items.map((item) => item.raw)).toEqual(['milk', 'milk', 'milk', 'milk', 'milk']);
    expect(items.map((item) => item.variant)).toEqual([
      'semi skimmed',
      'whole',
      'skimmed',
      'soy',
      'oat',
    ]);
    expect(items.every((item) => item.matchedSection === 'chilled_milk_juice_cream')).toBe(true);
    expect(getDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getVariantPrefixedDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getVariantPrefixedDisplayValue(items[1])).toBe('Whole Milk');
    expect(getVariantPrefixedDisplayValue(items[2])).toBe('Skimmed Milk');
    expect(getVariantPrefixedDisplayValue(items[3])).toBe('Soy Milk');
    expect(getVariantPrefixedDisplayValue(items[4])).toBe('Oat Milk');
    expect(getStoredValue(items[0])).toBe('semi skimmed milk');
  });

  it('parses cream styles as variants without treating whipped cream as a variant', () => {
    const items = parseItems('single cream\ndouble cream\nwhipping cream\nwhipped cream', UK_CONFIG);

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({
      raw: 'cream',
      variant: 'single',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(items[1]).toMatchObject({
      raw: 'cream',
      variant: 'double',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(items[2]).toMatchObject({
      raw: 'cream',
      variant: 'whipping',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(items[3]).toMatchObject({
      raw: 'whipped cream',
      variant: undefined,
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(getStoredValue(items[0])).toBe('single cream');
    expect(getStoredValue(items[3])).toBe('whipped cream');
  });

  it('parses drink and alcohol flavours as variants of the base drink', () => {
    const items = parseItems(
      [
        'pepsi max cherry',
        'cherry pepsi max',
        'mango coke zero',
        'kopparberg pear cider',
        'kopparberg strawberry and lime',
        'rekorderlig wild berries',
        'kopparberg lemon vodka',
        'jack daniels honey',
      ].join('\n'),
      UK_CONFIG,
    );

    expect(items).toHaveLength(7);
    expect(items[0]).toMatchObject({
      raw: 'pepsi max',
      variant: 'cherry',
      matchedSection: 'drinks',
    });
    expect(items[1]).toMatchObject({
      raw: 'coke zero',
      variant: 'mango',
      matchedSection: 'drinks',
    });
    expect(items[2]).toMatchObject({
      raw: 'kopparberg cider',
      variant: 'pear',
      matchedSection: 'alcohol',
    });
    expect(items[3]).toMatchObject({
      raw: 'kopparberg cider',
      variant: 'strawberry and lime',
      matchedSection: 'alcohol',
    });
    expect(items[4]).toMatchObject({
      raw: 'rekorderlig cider',
      variant: 'wild berries',
      matchedSection: 'alcohol',
    });
    expect(items[5]).toMatchObject({
      raw: 'kopparberg vodka',
      variant: 'lemon',
      matchedSection: 'alcohol',
    });
    expect(items[6]).toMatchObject({
      raw: 'jack daniels',
      variant: 'honey',
      matchedSection: 'alcohol',
    });
    expect(getStoredValue(items[0])).toBe('cherry pepsi max');
    expect(getVariantPrefixedDisplayValue(items[0])).toBe('Cherry Pepsi Max');
    expect(getStoredValue(items[2])).toBe('pear kopparberg cider');
    expect(getVariantPrefixedDisplayValue(items[2])).toBe('Pear Kopparberg Cider');
  });

  it('corrects common misspellings before matching and display', () => {
    const items = parseItems('spagetti\nbrocoli\nstrawbery yogurt\nkopperberg pear cider\nparacetemol', UK_CONFIG);

    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({
      raw: 'spaghetti',
      matchedSection: 'pasta',
    });
    expect(getDisplayValue(items[0])).toBe('Spaghetti');
    expect(items[1]).toMatchObject({
      raw: 'broccoli',
      matchedSection: 'produce',
    });
    expect(items[2]).toMatchObject({
      raw: 'yogurt',
      variant: 'strawberry',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(items[3]).toMatchObject({
      raw: 'kopparberg cider',
      variant: 'pear',
      matchedSection: 'alcohol',
    });
    expect(items[4]).toMatchObject({
      raw: 'paracetamol',
      matchedSection: 'health_beauty',
    });
  });

  it('preserves checked state from previously saved combined variant names', () => {
    const items = parseItems('strawberry ice cream', UK_CONFIG, [
      {
        id: 'saved-item',
        raw: 'strawberry ice cream',
        normalized: 'strawberry ice cream',
        cleaned: 'strawberry ice cream',
        checked: true,
        matchedSection: 'frozen_ice_cream',
      },
    ]);

    expect(items[0]).toMatchObject({
      id: 'saved-item',
      raw: 'ice cream',
      variant: 'strawberry',
      checked: true,
    });
  });

  it('preserves previous checked state when the same parsed item is entered again', () => {
    const items = parseItems('large bananas x2', UK_CONFIG, [
      {
        id: 'previous-bananas',
        raw: 'bananas',
        normalized: 'bananas',
        cleaned: 'banana',
        size: 'large',
        sizeValue: 'L',
        quantityValue: 2,
        checked: true,
        matchedSection: 'produce',
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: 'previous-bananas',
      raw: 'bananas',
      size: 'large',
      sizeValue: 'L',
      quantityValue: 2,
      checked: true,
    });
  });

  it('strips pasted display size labels before reparsing saved text', () => {
    const items = parseItems('Milk (Size: S)', UK_CONFIG);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      raw: 'milk',
      variant: 'semi skimmed',
      size: undefined,
      sizeValue: undefined,
    });
  });
});
