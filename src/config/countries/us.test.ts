import { describe, expect, it } from 'vitest';
import { US_CONFIG } from './us';

describe('US config', () => {
  it('includes the US-specific aisles', () => {
    const fresh = US_CONFIG.groups.find((group) => group.key === 'food_fresh');
    const seafood = fresh?.sections.find((section) => section.key === 'seafood_counter');

    expect(US_CONFIG.code).toBe('us');
    expect(US_CONFIG.label).toBe('United States');
    expect(seafood?.keywords).toContain('shrimp');
  });
});
