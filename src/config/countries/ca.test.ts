import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from './ca';

describe('Canada config', () => {
  it('includes the Canadian-specific aisles', () => {
    const pantry = CA_CONFIG.groups.find((group) => group.key === 'food_pantry');
    const snacks = pantry?.sections.find((section) => section.key === 'snacks');

    expect(CA_CONFIG.code).toBe('ca');
    expect(CA_CONFIG.label).toBe('Canada');
    expect(snacks?.keywords).toContain('ketchup chips');
  });
});
