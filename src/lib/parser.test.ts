import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from '../config/countries/uk';
import { getDisplayValue, getQuantityDisplayValue, getSizeDisplayValue, getStoredValue, parseItems } from './parser';

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
    expect(getDisplayValue(items[0])).toBe('Semi-Skimmed Milk');
    expect(getStoredValue(items[0])).toBe('small milk');

    expect(items[1]).toMatchObject({
      raw: 'bananas',
      quantity: 'x2',
      quantityValue: 2,
      matchedSection: 'produce',
    });
    expect(getQuantityDisplayValue(items[1])).toBe('Qty: 2');
    expect(getDisplayValue(items[1])).toBe('Bananas');

    expect(items[2]).toMatchObject({
      raw: 'mince',
      quantity: '500g',
      matchedSection: 'chilled_fresh_meat',
    });
    expect(getQuantityDisplayValue(items[2])).toBe('500g');
  });
});
