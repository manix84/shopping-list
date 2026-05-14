import { describe, expect, it } from 'vitest';
import { canPersistSharedListRecord, isEmptyShoppingListRecord } from './sharedListPolicy.mjs';

const record = (overrides = {}) => ({
  input: '',
  items: [],
  ...overrides,
});

describe('shared list persistence policy', () => {
  it('treats whitespace-only input with no items as an empty shopping list', () => {
    expect(isEmptyShoppingListRecord(record({ input: '  \n\t  ' }))).toBe(true);
  });

  it('does not treat text input or parsed items as empty', () => {
    expect(isEmptyShoppingListRecord(record({ input: 'milk' }))).toBe(false);
    expect(isEmptyShoppingListRecord(record({ items: [{ raw: 'milk' }] }))).toBe(false);
  });

  it('blocks empty shared-list persistence until a second client is connected', () => {
    expect(canPersistSharedListRecord(record(), 0)).toBe(false);
    expect(canPersistSharedListRecord(record(), 1)).toBe(false);
    expect(canPersistSharedListRecord(record(), 2)).toBe(true);
  });

  it('allows non-empty shared-list persistence without another client', () => {
    expect(canPersistSharedListRecord(record({ input: 'milk' }), 0)).toBe(true);
  });
});
