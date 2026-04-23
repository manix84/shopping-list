import { describe, expect, it } from 'vitest';
import {
  cleanEntryName,
  cleanLine,
  formatDisplayName,
  normalize,
  pluralizeEntryName,
  stripDisplaySizeLabel,
} from './stringUtils';

describe('string utilities', () => {
  it('cleans list lines', () => {
    expect(cleanLine('  - bananas   ')).toBe('bananas');
  });

  it('normalizes punctuation and accents', () => {
    expect(normalize('Crème fraîche & chips')).toBe('creme fraiche and chips');
  });

  it('pluralizes the trailing word only', () => {
    expect(pluralizeEntryName('baby food')).toBe('baby foods');
  });

  it.each([
    ['ham slices', undefined, 'Ham Slices'],
    ['ice-cream', undefined, 'Ice-Cream'],
    ['cookies and cream ice-cream', undefined, 'Cookies and Cream Ice-Cream'],
    ['bananas', 2, 'Bananas'],
    ['blue milk', undefined, 'Whole Milk'],
    ['small milk', 2, 'Small Milk'],
  ])('formats %s', (input, quantityValue, expected) => {
    expect(formatDisplayName(input, quantityValue)).toBe(expected);
  });

  it('strips size labels from pasted text', () => {
    expect(stripDisplaySizeLabel('Milk (size: S)')).toBe('Milk');
  });

  it('cleans entry names for matching', () => {
    expect(cleanEntryName('free-range bananas')).toBe('banana');
  });
});
