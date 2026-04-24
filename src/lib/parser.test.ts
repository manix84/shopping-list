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
  parseItems,
} from './parser';

describe('parser', () => {
  it('parses quantity, size, and display metadata together', () => {
    const items = parseItems('small milk\nbananas x2\n500g mince', UK_CONFIG);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      raw: 'milk',
      size: 'small',
      sizeValue: 'S',
      matchedSection: 'chilled_milk_juice_cream',
    });
    expect(getSizeDisplayValue(items[0])).toBe('Size: S');
    expect(getSizeValue(items[0])).toBe('S');
    expect(getDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getStoredValue(items[0])).toBe('small milk');

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
      raw: 'Chicken Thighs',
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
});
