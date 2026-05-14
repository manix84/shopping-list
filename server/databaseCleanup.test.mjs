import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

const emptyRecord = {
  input: '',
  items: [],
  updatedAt: '2026-05-14T12:00:00.000Z',
  countryCode: 'uk',
};

const item = {
  id: 'item-1',
  raw: 'milk',
  normalized: 'milk',
  cleaned: 'milk',
  checked: false,
  matchedSection: 'chilled_milk_juice_cream',
};

const nonEmptyRecord = {
  input: 'milk',
  items: [item],
  updatedAt: '2026-05-14T12:00:00.000Z',
  countryCode: 'uk',
};

const importDatabase = async () => {
  vi.resetModules();
  return import('./database.mjs');
};

describe('database empty shared-list cleanup', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('pg');
    vi.resetModules();
  });

  it('removes empty JSON shared lists and keeps non-empty shared lists', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'shopping-list-db-'));
    vi.stubEnv('SHOPPING_LIST_DB_PATH', join(directory, 'database.json'));
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('SHOPPING_LIST_DATABASE_URL', '');
    const database = await importDatabase();
    const emptyListId = '019dbf30-56de-7b2b-aacc-a5ae59430d7f';
    const nonEmptyListId = '019dbf30-56de-7b2b-aacc-a5ae59430d80';

    await database.saveSharedList(emptyListId, { ...emptyRecord, listId: emptyListId, serverBacked: true });
    await database.saveSharedList(nonEmptyListId, { ...nonEmptyRecord, listId: nonEmptyListId, serverBacked: true });

    await expect(database.pruneEmptySharedLists()).resolves.toEqual({
      deletedCount: 1,
      deletedIds: [emptyListId],
    });
    await expect(database.getSharedList(emptyListId)).resolves.toMatchObject({ exists: false });
    await expect(database.getSharedList(nonEmptyListId)).resolves.toMatchObject({
      exists: true,
      record: {
        input: 'milk',
        items: [item],
      },
    });
  });

  it('removes empty Postgres shared lists with the expected DELETE criteria', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: 1 }] })
      .mockResolvedValueOnce({
        rows: [
          { id: '019dbf30-56de-7b2b-aacc-a5ae59430d7f' },
          { id: '019dbf30-56de-7b2b-aacc-a5ae59430d80' },
        ],
    });
    const end = vi.fn().mockResolvedValue(undefined);
    const Pool = vi.fn(function MockPool() {
      return { query, end };
    });

    vi.doMock('pg', () => ({ default: { Pool } }));
    vi.stubEnv('DATABASE_URL', 'postgres://shopping-list.test/db');
    vi.stubEnv('SHOPPING_LIST_DATABASE_URL', '');

    const database = await importDatabase();
    await expect(database.pruneEmptySharedLists()).resolves.toEqual({
      deletedCount: 2,
      deletedIds: [
        '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
        '019dbf30-56de-7b2b-aacc-a5ae59430d80',
      ],
    });

    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgres://shopping-list.test/db',
      ssl: undefined,
    });
    const deleteQuery = query.mock.calls[2]?.[0];
    expect(deleteQuery).toContain('DELETE FROM shared_lists');
    expect(deleteQuery).toContain("btrim(coalesce(record->>'input', '')) = ''");
    expect(deleteQuery).toContain("jsonb_typeof(record->'items') = 'array'");
    expect(deleteQuery).toContain("jsonb_array_length(record->'items') = 0");
    expect(deleteQuery).toContain('RETURNING id');

    await database.closeDatabase();
    expect(end).toHaveBeenCalled();
  });
});
