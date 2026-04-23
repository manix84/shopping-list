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
    ['large free-range eggs', { size: 'large', sizeValue: 'L', name: 'free-range eggs' }],
    ['milk', { name: 'milk' }],
  ])('extracts %s', (input, expected) => {
    expect(extractSize(input)).toMatchObject(expected);
  });
});
