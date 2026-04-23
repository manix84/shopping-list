import { describe, expect, it } from 'vitest';
import { extractQuantity, formatCountQuantity, parseQuantityValue } from './quantity';

describe('quantity helpers', () => {
  it('formats count quantities', () => {
    expect(formatCountQuantity(2)).toBe('x2');
  });

  it.each([
    ['x2', 2],
    ['2x', 2],
    ['2', 2],
  ])('parses %s', (input, expected) => {
    expect(parseQuantityValue(input)).toBe(expected);
  });

  it.each([
    ['bananas x2', { name: 'bananas', quantity: 'x2', quantityValue: 2 }],
    ['2x apples', { name: 'apples', quantity: 'x2', quantityValue: 2 }],
    ['4 carrots', { name: 'carrots', quantity: 'x4', quantityValue: 4 }],
    ['500g mince', { name: 'mince', quantity: '500g' }],
    ['1.5kg potatoes', { name: 'potatoes', quantity: '1.5kg' }],
  ])('extracts %s', (input, expected) => {
    expect(extractQuantity(input)).toMatchObject(expected);
  });
});
