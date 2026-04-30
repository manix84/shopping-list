import { describe, expect, it } from 'vitest';
import { extractQuantifiedItem, extractQuantity, formatCountQuantity, parseQuantityValue } from './quantity';

describe('quantity helpers', () => {
  it('formats count quantities', () => {
    expect(formatCountQuantity(2)).toBe('x2');
  });

  it.each([
    ['x2', 2],
    ['x 2', 2],
    ['2x', 2],
    ['2 x', 2],
    ['2', 2],
    ['1.5', 1.5],
    ['x1.5', 1.5],
  ])('parses %s', (input, expected) => {
    expect(parseQuantityValue(input)).toBe(expected);
  });

  it.each(['two', 'x', '2kg', '', undefined])('rejects non-count quantity %s', (input) => {
    expect(parseQuantityValue(input)).toBeUndefined();
  });

  it.each([
    ['bananas x2', { name: 'bananas', quantity: 'x2', quantityValue: 2 }],
    ['2x apples', { name: 'apples', quantity: 'x2', quantityValue: 2 }],
    ['x3 pears', { name: 'pears', quantity: 'x3', quantityValue: 3 }],
    ['4 carrots', { name: 'carrots', quantity: 'x4', quantityValue: 4 }],
    ['500g mince', { name: 'mince', quantity: '500g' }],
    ['mince 500g', { name: 'mince', quantity: '500g' }],
    ['1.5kg potatoes', { name: 'potatoes', quantity: '1.5kg' }],
  ])('extracts %s', (input, expected) => {
    expect(extractQuantity(input)).toMatchObject(expected);
  });

  it('returns a trimmed name when there is no quantity', () => {
    expect(extractQuantity('  bananas  ')).toEqual({ name: 'bananas', quantity: undefined });
  });

  it('extracts count and unit quantity together', () => {
    expect(extractQuantifiedItem('2x 500g bags of rice')).toMatchObject({
      name: 'bags of rice',
      quantity: '500g',
      quantityValue: 2,
    });
  });
});
