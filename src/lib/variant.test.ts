import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from '../config/countries/uk';
import { extractVariant } from './variant';

describe('variant extraction', () => {
  it('returns an empty name for non-string values', () => {
    expect(extractVariant(undefined, UK_CONFIG)).toEqual({ name: '' });
  });

  it('applies default milk variants and colour aliases', () => {
    expect(extractVariant('milk', UK_CONFIG)).toEqual({ name: 'milk', variant: 'semi skimmed' });
    expect(extractVariant('blue milk', UK_CONFIG)).toEqual({ name: 'milk', variant: 'whole' });
    expect(extractVariant('red milk', UK_CONFIG)).toEqual({ name: 'milk', variant: 'skimmed' });
  });

  it('extracts variants before variantable base keywords', () => {
    expect(extractVariant('lemon and lime yogurt', UK_CONFIG)).toEqual({
      name: 'yogurt',
      variant: 'lemon and lime',
    });
    expect(extractVariant('cookies and cream ice cream', UK_CONFIG)).toEqual({
      name: 'ice cream',
      variant: 'cookies and cream',
    });
  });

  it('extracts bracketed variants without treating bracketed sizes or measurements as variants', () => {
    expect(extractVariant('Mayonnaise (full-fat)', UK_CONFIG)).toEqual({
      name: 'Mayonnaise',
      variant: 'full fat',
    });
    expect(extractVariant('Mayonnaise (large)', UK_CONFIG)).toEqual({ name: 'Mayonnaise (large)' });
    expect(extractVariant('Mayonnaise (25ml)', UK_CONFIG)).toEqual({ name: 'Mayonnaise (25ml)' });
  });

  it('does not extract variants for explicit exclusions or exact keyword matches', () => {
    expect(extractVariant('whipped cream', UK_CONFIG)).toEqual({ name: 'whipped cream' });
    expect(extractVariant('ice cream', UK_CONFIG)).toEqual({ name: 'ice cream' });
  });

  it('handles drink variants before and after the base product', () => {
    expect(extractVariant('coke zero cherry', UK_CONFIG)).toEqual({ name: 'coke zero', variant: 'cherry' });
    expect(extractVariant('lime pepsi max', UK_CONFIG)).toEqual({ name: 'pepsi max', variant: 'lime' });
  });

  it('handles drink variants inserted before a middle suffix', () => {
    expect(extractVariant('kopparberg strawberry lime cider', UK_CONFIG)).toEqual({
      name: 'kopparberg cider',
      variant: 'strawberry lime',
    });
    expect(extractVariant('rekorderlig mango raspberry', UK_CONFIG)).toEqual({
      name: 'rekorderlig cider',
      variant: 'mango raspberry',
    });
  });

  it('leaves unmatched products unchanged', () => {
    expect(extractVariant('artisan sourdough loaf', UK_CONFIG)).toEqual({ name: 'artisan sourdough loaf' });
  });

  it('extracts a generic suffix variant when only the base keyword is known', () => {
    expect(extractVariant('seeded bread', UK_CONFIG)).toEqual({
      name: 'bread',
      variant: 'seeded',
    });
  });
});
