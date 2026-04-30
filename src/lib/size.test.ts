import { describe, expect, it } from 'vitest';
import { extractSize, formatSizeLabel, parseSizeValue } from './size';

describe('size helpers', () => {
  it.each([
    ['small', 'S'],
    ['s', 'S'],
    ['medium', 'M'],
    ['m', 'M'],
    ['large', 'L'],
    ['l', 'L'],
  ])('parses %s', (input, expected) => {
    expect(parseSizeValue(input)).toBe(expected);
  });

  it('formats size labels', () => {
    expect(formatSizeLabel('S')).toBe('Size: S');
  });

  it.each([
    ['small milk', { size: 'small', sizeValue: 'S', name: 'milk' }],
    ['Medium pasta', { size: 'medium', sizeValue: 'M', name: 'pasta' }],
    ['large free-range eggs', { size: 'large', sizeValue: 'L', name: 'free-range eggs' }],
    ['large', { name: 'large' }],
    ['small  ', { name: 'small' }],
    [undefined, { name: '' }],
    ['milk', { name: 'milk' }],
  ])('extracts %s', (input, expected) => {
    expect(extractSize(input)).toMatchObject(expected);
  });

  it('rejects unknown size values', () => {
    expect(parseSizeValue('extra large')).toBeUndefined();
    expect(parseSizeValue('xl')).toBeUndefined();
    expect(parseSizeValue(undefined)).toBeUndefined();
  });
});
