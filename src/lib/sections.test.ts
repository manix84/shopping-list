import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { buildKeywordPattern, detectSection, flattenSections, getSectionMeta } from './sections';

describe('section detection', () => {
  it.each([
    [UK_CONFIG, 'baby food', 'baby_food'],
    [UK_CONFIG, 'pasta', 'pasta'],
    [UK_CONFIG, 'linguini', 'pasta'],
    [UK_CONFIG, 'spagetti', 'pasta'],
    [UK_CONFIG, 'brocoli', 'produce'],
    [UK_CONFIG, 'paracetemol', 'health_beauty'],
    [UK_CONFIG, 'eggs', 'home_baking'],
    [UK_CONFIG, 'large free-range eggs', 'home_baking'],
    [UK_CONFIG, 'plain flour', 'home_baking'],
    [UK_CONFIG, 'cream of tartar', 'home_baking'],
    [UK_CONFIG, 'golden syrup', 'home_baking'],
    [UK_CONFIG, 'edible glitter', 'home_baking'],
    [UK_CONFIG, 'sultanas', 'home_baking'],
    [UK_CONFIG, 'custard powder', 'home_baking'],
    [US_CONFIG, 'shrimp', 'seafood_counter'],
    [US_CONFIG, 'green onion', 'produce'],
    [CA_CONFIG, 'maple syrup', 'pantry'],
    [CA_CONFIG, 'ketchup chips', 'snacks'],
  ])('detects %s -> %s', (config, input, expected) => {
    expect(detectSection(input, config)).toBe(expected);
  });

  it('returns section metadata', () => {
    expect(getSectionMeta(UK_CONFIG, 'pasta')).toMatchObject({
      label: 'Pasta',
      groupLabel: 'Cupboard Staples',
      order: 5,
    });
  });

  it('falls back to other for missing config, empty names, and unknown metadata', () => {
    expect(flattenSections(undefined)).toEqual([]);
    expect(detectSection('', UK_CONFIG)).toBe('other');
    expect(detectSection('mystery imported snack', undefined)).toBe('other');
    expect(getSectionMeta(UK_CONFIG, 'not_a_section' as never)).toEqual({
      label: 'Other',
      groupLabel: 'Other',
      order: 999,
    });
  });

  it('builds keyword patterns using cleaned whole-word matches', () => {
    const pattern = buildKeywordPattern('free-range eggs');

    expect(pattern.test('free range egg')).toBe(true);
    expect(pattern.test('eggplant')).toBe(false);
  });

  it('prefers the longest matching keyword over an earlier broader match', () => {
    expect(detectSection('ice cream cones', UK_CONFIG)).toBe('frozen_ice_cream');
  });
});
