import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../../config/countries/ca';
import { encodeShoppingListRecord, decodeShoppingListRecord } from './recordCodec';
import { parseItems } from '../parser';

describe('record codec', () => {
  it('round-trips a saved record', () => {
    const input = 'maple syrup\nbaby food';
    const record = {
      input,
      items: parseItems(input, CA_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'ca' as const,
    };

    const decoded = decodeShoppingListRecord(encodeShoppingListRecord(record));

    expect(decoded).toMatchObject({
      input,
      updatedAt: record.updatedAt,
      countryCode: 'ca',
    });
    expect(decoded?.items).toHaveLength(2);
  });

  it('falls back cleanly for invalid JSON', () => {
    expect(decodeShoppingListRecord('not json')).toBeUndefined();
  });
});
