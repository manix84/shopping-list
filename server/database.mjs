import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import pg from 'pg';
import './env.mjs';
import { COUNTRY_CODES } from './constants.mjs';

const { Pool } = pg;

const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const isIsoTimestamp = (value) => {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) { return false; }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const timestampOrNow = (value) => isIsoTimestamp(value) ? value : new Date().toISOString();

const defaultRecord = () => ({
  input: '',
  items: [],
  updatedAt: new Date().toISOString(),
  countryCode: 'uk',
});

const databaseUrl = process.env.DATABASE_URL ?? process.env.SHOPPING_LIST_DATABASE_URL;
const databasePath = resolve(process.env.SHOPPING_LIST_DB_PATH ?? 'data/shopping-list-db.json');
let databaseWriteQueue = Promise.resolve();
let pool;
let schemaReady;

const databaseErrorCode = (error) => {
  if (typeof error?.code === 'string' && error.code) { return error.code; }
  if (Array.isArray(error?.errors)) {
    for (const nestedError of error.errors) {
      const nestedCode = databaseErrorCode(nestedError);
      if (nestedCode) { return nestedCode; }
    }
  }
  return undefined;
};

const databaseErrorMessage = (error) => {
  if (typeof error?.message === 'string' && error.message) { return error.message; }
  if (Array.isArray(error?.errors)) {
    for (const nestedError of error.errors) {
      const nestedMessage = databaseErrorMessage(nestedError);
      if (nestedMessage) { return nestedMessage; }
    }
  }
  return 'Unable to read database status';
};

const emptyDatabase = () => ({ sharedLists: {} });

const normalizeRecord = (record) => {
  const fallback = defaultRecord();
  return {
    ...fallback,
    ...(record && typeof record === 'object' ? record : {}),
    updatedAt: timestampOrNow(record?.updatedAt),
    countryCode: COUNTRY_CODES.has(record?.countryCode) ? record.countryCode : fallback.countryCode,
  };
};

const normalizeDatabase = (database) => ({
  ...emptyDatabase(),
  ...database,
  sharedLists: database?.sharedLists && typeof database.sharedLists === 'object' ? database.sharedLists : {},
});

const readJsonDatabase = async () => {
  try {
    const raw = await readFile(databasePath, 'utf8');
    try {
      return normalizeDatabase(JSON.parse(raw));
    } catch (error) {
      if (!(error instanceof SyntaxError)) { throw error; }

      const corruptPath = `${databasePath}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      await rename(databasePath, corruptPath);
      console.warn(`Database JSON was invalid. Moved corrupt file to ${corruptPath} and started with an empty database.`);
      return emptyDatabase();
    }
  } catch (error) {
    if (error?.code === 'ENOENT') { return emptyDatabase(); }
    throw error;
  }
};

const withJsonDatabaseWriteLock = async (callback) => {
  const run = databaseWriteQueue.then(callback);
  databaseWriteQueue = run.catch(() => {});
  return run;
};

const writeJsonDatabase = async (database) => {
  await mkdir(dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.tmp-${process.pid}-${Date.now()}`;
  const normalizedDatabase = normalizeDatabase(database);
  const serializedDatabase = { sharedLists: normalizedDatabase.sharedLists };
  await writeFile(temporaryPath, `${JSON.stringify(serializedDatabase, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, databasePath);
};

const shouldUseSsl = () =>
  process.env.DATABASE_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  databaseUrl?.includes('sslmode=require') === true;

const databaseConnectionString = () => {
  if (!databaseUrl || !shouldUseSsl()) { return databaseUrl; }

  try {
    const parsedUrl = new URL(databaseUrl);
    parsedUrl.searchParams.delete('sslmode');
    return parsedUrl.toString();
  } catch {
    return databaseUrl;
  }
};

const getPool = () => {
  if (!databaseUrl) { return undefined; }
  if (!pool) {
    pool = new Pool({
      connectionString: databaseConnectionString(),
      ssl: shouldUseSsl() ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
};

const ensurePostgresSchema = async () => {
  const postgres = getPool();
  if (!postgres) { return; }

  await postgres.query(`
    CREATE TABLE IF NOT EXISTS shared_lists (
      id uuid PRIMARY KEY,
      record jsonb NOT NULL,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL
    );
  `);

  await migrateJsonFallbackToPostgresIfEmpty(postgres);
};

const migrateJsonFallbackToPostgresIfEmpty = async (postgres) => {
  const sharedListCountResult = await postgres.query('SELECT COUNT(*)::integer AS count FROM shared_lists');
  const postgresHasData = (sharedListCountResult.rows[0]?.count ?? 0) > 0;
  if (postgresHasData) { return; }

  const legacyDatabase = await readJsonDatabase();
  const hasLegacyData = Object.keys(legacyDatabase.sharedLists).length > 0;
  if (!hasLegacyData) { return; }

  await postgres.query('BEGIN');
  try {
    for (const sharedList of Object.values(legacyDatabase.sharedLists)) {
      if (!isSharedListId(sharedList?.id) || !sharedList?.record) { continue; }
      const createdAt = sharedList.createdAt ?? new Date().toISOString();
      const updatedAt = sharedList.updatedAt ?? sharedList.record.updatedAt ?? createdAt;
      await postgres.query(
        `
          INSERT INTO shared_lists (id, record, created_at, updated_at)
          VALUES ($1::uuid, $2::jsonb, $3::timestamptz, $4::timestamptz)
          ON CONFLICT (id) DO NOTHING
        `,
        [sharedList.id, JSON.stringify(normalizeRecord(sharedList.record)), createdAt, updatedAt],
      );
    }

    await postgres.query('COMMIT');
    console.log(`Migrated existing JSON database from ${databasePath} into Postgres.`);
  } catch (error) {
    await postgres.query('ROLLBACK');
    throw error;
  }
};

export const initializeDatabase = async () => {
  if (!getPool()) { return; }
  schemaReady ??= ensurePostgresSchema();
  await schemaReady;
};

const postgresQuery = async (text, params = []) => {
  await initializeDatabase();
  const postgres = getPool();
  if (!postgres) { throw new Error('PostgreSQL is not configured'); }
  return postgres.query(text, params);
};

const isoString = (value) => {
  if (value instanceof Date) { return value.toISOString(); }
  return typeof value === 'string' ? value : undefined;
};

const uuidV7 = () => {
  const timestamp = BigInt(Date.now());
  const bytes = randomBytes(16);

  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const isSharedListId = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const createSharedList = async (record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const id = uuidV7();
      const now = new Date().toISOString();
      const normalizedRecord = normalizeRecord(record);

      database.sharedLists[id] = {
        id,
        exists: true,
        record: normalizedRecord,
        createdAt: now,
        updatedAt: normalizedRecord.updatedAt || now,
      };

      await writeJsonDatabase(database);
      return database.sharedLists[id];
    });
  }

  const id = uuidV7();
  const now = new Date().toISOString();
  const normalizedRecord = normalizeRecord(record);
  const result = await postgresQuery(
    `
      INSERT INTO shared_lists (id, record, created_at, updated_at)
      VALUES ($1::uuid, $2::jsonb, $3::timestamptz, $4::timestamptz)
      RETURNING id, record, created_at, updated_at
    `,
    [id, JSON.stringify(normalizedRecord), now, normalizedRecord.updatedAt || now],
  );
  const row = result.rows[0];
  return {
    id: row.id,
    exists: true,
    record: normalizeRecord(row.record),
    createdAt: isoString(row.created_at),
    updatedAt: normalizedRecord.updatedAt || isoString(row.updated_at),
  };
};

export const getSharedList = async (id) => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    const stored = database.sharedLists[id];
    if (!stored) {
      return {
        id,
        exists: false,
        record: defaultRecord(),
      };
    }

    const normalizedRecord = normalizeRecord(stored.record);
    return {
      ...stored,
      id,
      exists: stored.exists === true,
      record: normalizedRecord,
      createdAt: timestampOrNow(stored.createdAt),
      updatedAt: normalizedRecord.updatedAt || timestampOrNow(stored.updatedAt),
    };
  }

  const result = await postgresQuery('SELECT id, record, created_at, updated_at FROM shared_lists WHERE id = $1::uuid', [id]);
  const row = result.rows[0];
  const normalizedRecord = row ? normalizeRecord(row.record) : undefined;
  return row
    ? {
        id: row.id,
        exists: true,
        record: normalizedRecord,
        createdAt: isoString(row.created_at),
        updatedAt: normalizedRecord.updatedAt || isoString(row.updated_at),
      }
    : {
        id,
        exists: false,
        record: defaultRecord(),
      };
};

export const saveSharedList = async (id, record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const existing = database.sharedLists[id];
      const now = new Date().toISOString();
      const normalizedRecord = normalizeRecord(record);

      database.sharedLists[id] = {
        id,
        exists: true,
        record: normalizedRecord,
        createdAt: existing?.createdAt ?? now,
        updatedAt: normalizedRecord.updatedAt || now,
      };

      await writeJsonDatabase(database);
      return database.sharedLists[id];
    });
  }

  const normalizedRecord = normalizeRecord(record);
  const now = new Date().toISOString();
  const result = await postgresQuery(
    `
      INSERT INTO shared_lists (id, record, created_at, updated_at)
      VALUES ($1::uuid, $2::jsonb, $3::timestamptz, $4::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        record = EXCLUDED.record,
        updated_at = EXCLUDED.updated_at
      RETURNING id, record, created_at, updated_at
    `,
    [id, JSON.stringify(normalizedRecord), now, normalizedRecord.updatedAt || now],
  );
  const row = result.rows[0];
  return {
    id: row.id,
    exists: true,
    record: normalizeRecord(row.record),
    createdAt: isoString(row.created_at),
    updatedAt: normalizedRecord.updatedAt || isoString(row.updated_at),
  };
};

export const clearSharedList = async (id) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      delete database.sharedLists[id];

      await writeJsonDatabase(database);
      return {
        id,
        exists: false,
        record: defaultRecord(),
      };
    });
  }

  await postgresQuery('DELETE FROM shared_lists WHERE id = $1::uuid', [id]);
  return {
    id,
    exists: false,
    record: defaultRecord(),
  };
};

const latestSharedListUpdatedAt = (sharedLists) => {
  const timestamps = Object.values(sharedLists)
    .map((sharedList) => sharedList?.updatedAt ?? sharedList?.record?.updatedAt)
    .filter(isIsoTimestamp)
    .sort((left, right) => Date.parse(right) - Date.parse(left));
  return timestamps[0];
};

export const getDatabaseStatus = async () => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    const sharedListUpdatedAt = latestSharedListUpdatedAt(database.sharedLists);

    return {
      ok: true,
      adapter: 'json',
      updatedAt: sharedListUpdatedAt,
      sharedListCount: Object.keys(database.sharedLists).length,
    };
  }

  let sharedLists;
  try {
    sharedLists = await postgresQuery('SELECT COUNT(*)::integer AS count, MAX(updated_at) AS updated_at FROM shared_lists');
  } catch (error) {
    return {
      ok: false,
      adapter: 'postgres',
      error: databaseErrorMessage(error),
      errorCode: databaseErrorCode(error),
    };
  }

  return {
    ok: true,
    adapter: 'postgres',
    updatedAt: isoString(sharedLists.rows[0]?.updated_at),
    sharedListCount: sharedLists.rows[0]?.count ?? 0,
  };
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
    schemaReady = undefined;
  }
};
