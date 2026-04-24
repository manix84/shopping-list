import { describe, expect, it } from 'vitest';
import type { ShoppingListRecord } from '../../types';
import { chooseNewestRecord } from './recordMerge';

const record = (input: string, updatedAt: string): ShoppingListRecord => ({
  listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
  serverBacked: true,
  input,
  items: [],
  updatedAt,
  countryCode: 'uk',
});

describe('chooseNewestRecord', () => {
  it('keeps a local browser record when the backend is empty', () => {
    const local = record('milk', '2026-04-22T00:00:00.000Z');
    const remote = record('', '1970-01-01T00:00:00.000Z');

    expect(
      chooseNewestRecord({
        local,
        remote,
        hasLocalRecord: true,
        hasRemoteRecord: false,
      }),
    ).toBe(local);
  });

  it('uses the backend record when the browser has no saved record', () => {
    const local = record('', '2026-04-24T00:00:00.000Z');
    const remote = record('eggs', '2026-04-23T00:00:00.000Z');

    expect(
      chooseNewestRecord({
        local,
        remote,
        hasLocalRecord: false,
        hasRemoteRecord: true,
      }),
    ).toBe(remote);
  });

  it('chooses the newer timestamp when both sides already have records', () => {
    const local = record('milk', '2026-04-24T00:00:00.000Z');
    const remote = record('eggs', '2026-04-23T00:00:00.000Z');

    expect(
      chooseNewestRecord({
        local,
        remote,
        hasLocalRecord: true,
        hasRemoteRecord: true,
      }),
    ).toBe(local);
  });
});
