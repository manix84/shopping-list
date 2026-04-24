import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../../config/countries/ca';
import { encodeShoppingListRecord, decodeShoppingListRecord } from './recordCodec';
import { parseItems } from '../parser';

describe('record codec', () => {
  it('round-trips a saved record', () => {
    const input = 'maple syrup\nbaby food';
    const record = {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
      serverBacked: true,
      input,
      items: parseItems(input, CA_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'ca' as const,
    };

    const decoded = decodeShoppingListRecord(encodeShoppingListRecord(record));

    expect(decoded).toMatchObject({
      listId: record.listId,
      serverBacked: true,
      input,
      updatedAt: record.updatedAt,
      countryCode: 'ca',
    });
    expect(decoded?.items).toHaveLength(2);
  });

  it('drops invalid list identity metadata', () => {
    const decoded = decodeShoppingListRecord(
      JSON.stringify({
        listId: 'not-a-uuid',
        serverBacked: true,
        input: '',
        items: [],
        updatedAt: '2026-04-22T00:00:00.000Z',
        countryCode: 'uk',
      }),
    );

    expect(decoded?.listId).toBeUndefined();
    expect(decoded?.serverBacked).toBe(true);
  });

  it('falls back cleanly for invalid JSON', () => {
    expect(decodeShoppingListRecord('not json')).toBeUndefined();
  });
});
