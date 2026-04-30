import { describe, expect, it } from 'vitest';
import {
  cleanEntryName,
  cleanLine,
  correctSpelling,
  ensureString,
  escapeRegExp,
  formatDisplayName,
  normalize,
  pluralizeEntryName,
  removeLeadingDescriptors,
  stripDisplaySizeLabel,
  unwrapContainerName,
} from './stringUtils';

describe('string utilities', () => {
  it('coerces only strings', () => {
    expect(ensureString('milk')).toBe('milk');
    expect(ensureString(123)).toBe('');
    expect(ensureString(null)).toBe('');
  });

  it('cleans list lines', () => {
    expect(cleanLine('  - bananas   ')).toBe('bananas');
    expect(cleanLine('  •   oat   milk  ')).toBe('oat milk');
    expect(cleanLine('* apples')).toBe('apples');
  });

  it('normalizes punctuation and accents', () => {
    expect(normalize('Crème fraîche & chips')).toBe('creme fraiche and chips');
  });

  it('pluralizes the trailing word only', () => {
    expect(pluralizeEntryName('baby food')).toBe('baby foods');
    expect(pluralizeEntryName('cherry tomato')).toBe('cherry tomatoes');
    expect(pluralizeEntryName('loaf')).toBe('loaves');
    expect(pluralizeEntryName('rice')).toBe('rice');
  });

  it.each([
    ['ham slices', undefined, 'Ham Slices'],
    ['ice-cream', undefined, 'Ice-Cream'],
    ['cookies and cream ice-cream', undefined, 'Cookies and Cream Ice-Cream'],
    ['bananas', 2, 'Bananas'],
    ['blue milk', undefined, 'Whole Milk'],
    ['small milk', 2, 'Small Milk'],
    ['bottle of water', 2, 'Bottle of Water'],
    ['', undefined, ''],
  ])('formats %s', (input, quantityValue, expected) => {
    expect(formatDisplayName(input, quantityValue)).toBe(expected);
  });

  it('strips size labels from pasted text', () => {
    expect(stripDisplaySizeLabel('Milk (size: S)')).toBe('Milk');
  });

  it('cleans entry names for matching', () => {
    expect(cleanEntryName('free-range bananas')).toBe('banana');
    expect(cleanEntryName('boxes of tomatoes')).toBe('tomato');
  });

  it('unwraps container prefixes from product names', () => {
    expect(unwrapContainerName('bags of rice')).toBe('rice');
    expect(unwrapContainerName('bag of basmati rice')).toBe('basmati rice');
    expect(unwrapContainerName('tray of chicken thighs')).toBe('chicken thighs');
  });

  it('corrects spelling after normalizing punctuation', () => {
    expect(correctSpelling('Kopperberg strawbery & lime')).toBe('kopparberg strawberry and lime');
  });

  it('removes leading descriptors before matching', () => {
    expect(removeLeadingDescriptors('fresh organic carrots')).toBe('organic carrots');
    expect(removeLeadingDescriptors('free-range eggs')).toBe('eggs');
  });

  it('escapes regular expression syntax', () => {
    expect(new RegExp(escapeRegExp('milk (2L)?')).test('milk (2L)?')).toBe(true);
  });
});
