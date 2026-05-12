import { describe, expect, it } from 'vitest';
import { UK_CONFIG } from '../config/countries/uk';
import { buildProductSuggestions, filterProductSuggestions } from './productSuggestions';

describe('product suggestions', () => {
  it('builds suggestions from country section keywords', () => {
    const suggestions = buildProductSuggestions(UK_CONFIG);

    expect(suggestions).toContainEqual(expect.objectContaining({
      value: 'banana',
      sectionKey: 'produce',
      sectionLabel: 'Produce',
    }));
    expect(suggestions).toContainEqual(expect.objectContaining({
      value: 'milk',
      sectionKey: 'chilled_milk_juice_cream',
    }));
  });

  it('dedupes suggestions case-insensitively while preserving route order', () => {
    const suggestions = buildProductSuggestions({
      ...UK_CONFIG,
      groups: [{
        key: 'test',
        label: 'Test',
        order: 1,
        sections: [
          { key: 'produce', label: 'Produce', keywords: ['Milk', 'milk', 'banana'] },
          { key: 'drinks', label: 'Drinks', keywords: ['BANANA', 'juice'] },
        ],
      }],
    });

    expect(suggestions.map((suggestion) => suggestion.value)).toEqual(['Milk', 'banana', 'juice']);
  });

  it('dedupes punctuation-only spelling variants', () => {
    const suggestions = buildProductSuggestions({
      ...UK_CONFIG,
      groups: [{
        key: 'test',
        label: 'Test',
        order: 1,
        sections: [
          { key: 'chilled_milk_juice_cream', label: 'Milk', keywords: ['semi skimmed milk', 'semi-skimmed milk'] },
        ],
      }],
    });

    expect(suggestions.map((suggestion) => suggestion.value)).toEqual(['semi skimmed milk']);
  });

  it('filters prefix matches before contains matches', () => {
    const suggestions = [
      { value: 'milk', sectionKey: 'chilled_milk_juice_cream' as const, sectionLabel: 'Milk' },
      { value: 'oat milk', sectionKey: 'chilled_milk_juice_cream' as const, sectionLabel: 'Milk' },
      { value: 'milk chocolate', sectionKey: 'snacks' as const, sectionLabel: 'Snacks' },
    ];

    expect(filterProductSuggestions(suggestions, 'mi').map((suggestion) => suggestion.value)).toEqual([
      'milk',
      'milk chocolate',
      'oat milk',
    ]);
  });

  it('does not show suggestions for tiny or exact queries', () => {
    const suggestions = buildProductSuggestions(UK_CONFIG);

    expect(filterProductSuggestions(suggestions, 'm')).toEqual([]);
    expect(filterProductSuggestions(suggestions, 'milk')).not.toContainEqual(expect.objectContaining({ value: 'milk' }));
  });

  it('matches suggestions across punctuation differences', () => {
    const suggestions = buildProductSuggestions({
      ...UK_CONFIG,
      groups: [{
        key: 'test',
        label: 'Test',
        order: 1,
        sections: [
          { key: 'chilled_milk_juice_cream', label: 'Milk', keywords: ['semi-skimmed milk'] },
        ],
      }],
    });

    expect(filterProductSuggestions(suggestions, 'semi skim').map((suggestion) => suggestion.value)).toEqual([
      'semi-skimmed milk',
    ]);
  });

  it('limits suggestions', () => {
    const suggestions = buildProductSuggestions(UK_CONFIG);

    expect(filterProductSuggestions(suggestions, 'ch', 3)).toHaveLength(3);
  });
});
