import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { detectSection, getSectionMeta } from './sections';

describe('section detection', () => {
  it.each([
    [UK_CONFIG, 'baby food', 'baby_food'],
    [UK_CONFIG, 'pasta', 'pasta'],
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
});
