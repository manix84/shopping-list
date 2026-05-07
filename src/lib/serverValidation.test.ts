import { describe, expect, it } from 'vitest';

const loadValidation = async () => {
  // @ts-expect-error Server ESM helpers are plain JavaScript modules.
  return import('../../server/validation.mjs') as Promise<{
    isIsoTimestamp: (value: unknown) => boolean;
    isSettingsRecord: (value: unknown) => boolean;
    isShoppingListRecord: (value: unknown, sharedListId?: string) => boolean;
  }>;
};

describe('server validation', () => {
  it('requires canonical ISO timestamps', async () => {
    const { isIsoTimestamp } = await loadValidation();

    expect(isIsoTimestamp('2026-04-22T00:00:00.000Z')).toBe(true);
    expect(isIsoTimestamp('Wed, 22 Apr 2026 00:00:00 GMT')).toBe(false);
    expect(isIsoTimestamp('2026-04-22')).toBe(false);
    expect(isIsoTimestamp('2026-99-22T00:00:00.000Z')).toBe(false);
  });

  it('validates settings against the full country list', async () => {
    const { isSettingsRecord } = await loadValidation();

    expect(isSettingsRecord({ countryCode: 'fr', updatedAt: '2026-04-22T00:00:00.000Z' })).toBe(true);
    expect(isSettingsRecord({ countryCode: 'xx', updatedAt: '2026-04-22T00:00:00.000Z' })).toBe(false);
  });

  it('rejects shopping-list items with unknown matched sections', async () => {
    const { isShoppingListRecord } = await loadValidation();
    const record = {
      input: 'milk',
      items: [
        {
          id: 'milk',
          raw: 'milk',
          normalized: 'milk',
          cleaned: 'milk',
          checked: false,
          matchedSection: 'unknown_section',
        },
      ],
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk',
    };

    expect(isShoppingListRecord(record)).toBe(false);
  });

  it('accepts the sauces section used by the UK cupboard config', async () => {
    const { isShoppingListRecord } = await loadValidation();
    const record = {
      input: 'tomato ketchup',
      items: [
        {
          id: 'ketchup',
          raw: 'tomato ketchup',
          normalized: 'tomato ketchup',
          cleaned: 'tomato ketchup',
          checked: false,
          matchedSection: 'sauces',
        },
      ],
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk',
    };

    expect(isShoppingListRecord(record)).toBe(true);
  });

  it('allows optional shopping-list names but rejects malformed names', async () => {
    const { isShoppingListRecord } = await loadValidation();
    const record = {
      listName: 'Weekly shop',
      input: 'milk',
      items: [
        {
          id: 'milk',
          raw: 'milk',
          normalized: 'milk',
          cleaned: 'milk',
          checked: false,
          matchedSection: 'chilled_milk_juice_cream',
        },
      ],
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk',
    };

    expect(isShoppingListRecord(record)).toBe(true);
    expect(isShoppingListRecord({ ...record, listName: 123 })).toBe(false);
  });
});
