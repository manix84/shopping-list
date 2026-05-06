import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import pg from 'pg';
import './env.mjs';
import { COUNTRY_CODES } from './constants.mjs';

const { Pool } = pg;

const DEFAULT_RECORD = {
  input: '',
  items: [],
  updatedAt: '1970-01-01T00:00:00.000Z',
  countryCode: 'uk',
};

const DEFAULT_SETTINGS = {
  countryCode: 'uk',
  updatedAt: '1970-01-01T00:00:00.000Z',
};

const databaseUrl = process.env.DATABASE_URL ?? process.env.SHOPPING_LIST_DATABASE_URL;
const databasePath = resolve(process.env.SHOPPING_LIST_DB_PATH ?? 'data/shopping-list-db.json');
let databaseWriteQueue = Promise.resolve();
let pool;
let schemaReady;

const emptyDatabase = () => ({
  settings: {
    exists: false,
    record: DEFAULT_SETTINGS,
  },
  shoppingList: {
    exists: false,
    record: DEFAULT_RECORD,
  },
  sharedLists: {},
});

const normalizeRecord = (record) => ({
  ...DEFAULT_RECORD,
  ...(record && typeof record === 'object' ? record : {}),
  countryCode: COUNTRY_CODES.has(record?.countryCode) ? record.countryCode : DEFAULT_RECORD.countryCode,
});

const normalizeSettingsRecord = (record) => ({
  ...DEFAULT_SETTINGS,
  ...(record && typeof record === 'object' ? record : {}),
  countryCode: COUNTRY_CODES.has(record?.countryCode) ? record.countryCode : DEFAULT_SETTINGS.countryCode,
});

const normalizeDatabase = (database) => ({
  ...emptyDatabase(),
  ...database,
  settings:
    database?.settings && typeof database.settings === 'object'
      ? {
          exists: database.settings.exists === true,
          record: normalizeSettingsRecord(database.settings.record),
        }
      : emptyDatabase().settings,
  shoppingList:
    database?.shoppingList && typeof database.shoppingList === 'object'
      ? {
          exists: database.shoppingList.exists === true,
          record: normalizeRecord(database.shoppingList.record),
        }
      : emptyDatabase().shoppingList,
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
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, databasePath);
};

const shouldUseSsl = () =>
  process.env.DATABASE_SSL === 'true' ||
  process.env.PGSSLMODE === 'require' ||
  databaseUrl?.includes('sslmode=require') === true;

const getPool = () => {
  if (!databaseUrl) { return undefined; }
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: shouldUseSsl() ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
};

const ensurePostgresSchema = async () => {
  const postgres = getPool();
  if (!postgres) { return; }

  await postgres.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id boolean PRIMARY KEY DEFAULT true CHECK (id),
      exists boolean NOT NULL DEFAULT false,
      record jsonb NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_list (
      id boolean PRIMARY KEY DEFAULT true CHECK (id),
      exists boolean NOT NULL DEFAULT false,
      record jsonb NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shared_lists (
      id uuid PRIMARY KEY,
      record jsonb NOT NULL,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL
    );
  `);

  await postgres.query(
    `
      INSERT INTO app_settings (id, exists, record)
      VALUES (true, false, $1::jsonb)
      ON CONFLICT (id) DO NOTHING
    `,
    [JSON.stringify(DEFAULT_SETTINGS)],
  );
  await postgres.query(
    `
      INSERT INTO shopping_list (id, exists, record)
      VALUES (true, false, $1::jsonb)
      ON CONFLICT (id) DO NOTHING
    `,
    [JSON.stringify(DEFAULT_RECORD)],
  );

  await migrateJsonFallbackToPostgresIfEmpty(postgres);
};

const migrateJsonFallbackToPostgresIfEmpty = async (postgres) => {
  const [settingsResult, shoppingListResult, sharedListCountResult] = await Promise.all([
    postgres.query('SELECT exists FROM app_settings WHERE id = true'),
    postgres.query('SELECT exists FROM shopping_list WHERE id = true'),
    postgres.query('SELECT COUNT(*)::integer AS count FROM shared_lists'),
  ]);
  const postgresHasData =
    settingsResult.rows[0]?.exists === true ||
    shoppingListResult.rows[0]?.exists === true ||
    (sharedListCountResult.rows[0]?.count ?? 0) > 0;
  if (postgresHasData) { return; }

  const legacyDatabase = await readJsonDatabase();
  const hasLegacyData =
    legacyDatabase.settings.exists ||
    legacyDatabase.shoppingList.exists ||
    Object.keys(legacyDatabase.sharedLists).length > 0;
  if (!hasLegacyData) { return; }

  await postgres.query('BEGIN');
  try {
    await postgres.query(
      'UPDATE app_settings SET exists = $1, record = $2::jsonb WHERE id = true',
      [legacyDatabase.settings.exists, JSON.stringify(legacyDatabase.settings.record)],
    );
    await postgres.query(
      'UPDATE shopping_list SET exists = $1, record = $2::jsonb WHERE id = true',
      [legacyDatabase.shoppingList.exists, JSON.stringify(legacyDatabase.shoppingList.record)],
    );

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

export const getShoppingList = async () => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    return database.shoppingList;
  }

  const result = await postgresQuery('SELECT exists, record FROM shopping_list WHERE id = true');
  const row = result.rows[0];
  return row
    ? { exists: row.exists === true, record: normalizeRecord(row.record) }
    : { exists: false, record: DEFAULT_RECORD };
};

export const getSettings = async () => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    return database.settings;
  }

  const result = await postgresQuery('SELECT exists, record FROM app_settings WHERE id = true');
  const row = result.rows[0];
  return row
    ? { exists: row.exists === true, record: normalizeSettingsRecord(row.record) }
    : { exists: false, record: DEFAULT_SETTINGS };
};

export const saveSettings = async (record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      database.settings = {
        exists: true,
        record,
      };
      await writeJsonDatabase(database);
      return database.settings;
    });
  }

  const normalizedRecord = normalizeSettingsRecord(record);
  const result = await postgresQuery(
    `
      INSERT INTO app_settings (id, exists, record)
      VALUES (true, true, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET exists = true, record = EXCLUDED.record
      RETURNING exists, record
    `,
    [JSON.stringify(normalizedRecord)],
  );
  return { exists: result.rows[0].exists === true, record: normalizeSettingsRecord(result.rows[0].record) };
};

export const saveShoppingList = async (record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      database.shoppingList = {
        exists: true,
        record,
      };
      await writeJsonDatabase(database);
      return database.shoppingList;
    });
  }

  const normalizedRecord = normalizeRecord(record);
  const result = await postgresQuery(
    `
      INSERT INTO shopping_list (id, exists, record)
      VALUES (true, true, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET exists = true, record = EXCLUDED.record
      RETURNING exists, record
    `,
    [JSON.stringify(normalizedRecord)],
  );
  return { exists: result.rows[0].exists === true, record: normalizeRecord(result.rows[0].record) };
};

export const createSharedList = async (record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const id = uuidV7();
      const now = new Date().toISOString();

      database.sharedLists[id] = {
        id,
        exists: true,
        record,
        createdAt: now,
        updatedAt: record.updatedAt || now,
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
    return database.sharedLists[id] ?? {
      id,
      exists: false,
      record: DEFAULT_RECORD,
    };
  }

  const result = await postgresQuery('SELECT id, record, created_at, updated_at FROM shared_lists WHERE id = $1::uuid', [id]);
  const row = result.rows[0];
  return row
    ? {
        id: row.id,
        exists: true,
        record: normalizeRecord(row.record),
        createdAt: isoString(row.created_at),
        updatedAt: row.record?.updatedAt ?? isoString(row.updated_at),
      }
    : {
        id,
        exists: false,
        record: DEFAULT_RECORD,
      };
};

export const saveSharedList = async (id, record) => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const existing = database.sharedLists[id];
      const now = new Date().toISOString();

      database.sharedLists[id] = {
        id,
        exists: true,
        record,
        createdAt: existing?.createdAt ?? now,
        updatedAt: record.updatedAt || now,
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
        record: DEFAULT_RECORD,
      };
    });
  }

  await postgresQuery('DELETE FROM shared_lists WHERE id = $1::uuid', [id]);
  return {
    id,
    exists: false,
    record: DEFAULT_RECORD,
  };
};

export const clearShoppingList = async () => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      database.shoppingList = {
        exists: false,
        record: DEFAULT_RECORD,
      };
      await writeJsonDatabase(database);
      return database.shoppingList;
    });
  }

  const result = await postgresQuery(
    `
      INSERT INTO shopping_list (id, exists, record)
      VALUES (true, false, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET exists = false, record = EXCLUDED.record
      RETURNING exists, record
    `,
    [JSON.stringify(DEFAULT_RECORD)],
  );
  return { exists: result.rows[0].exists === true, record: normalizeRecord(result.rows[0].record) };
};

export const getDatabaseStatus = async () => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    const shoppingList = database.shoppingList;

    return {
      ok: true,
      adapter: 'json',
      path: databasePath,
      settingsExists: database.settings.exists,
      settingsCountryCode: database.settings.record.countryCode,
      settingsUpdatedAt: database.settings.record.updatedAt,
      shoppingListExists: shoppingList.exists,
      updatedAt: shoppingList.record.updatedAt,
      sharedListCount: Object.keys(database.sharedLists).length,
    };
  }

  const [settings, shoppingList, sharedListCount] = await Promise.all([
    getSettings(),
    getShoppingList(),
    postgresQuery('SELECT COUNT(*)::integer AS count FROM shared_lists'),
  ]);

  return {
    ok: true,
    adapter: 'postgres',
    settingsExists: settings.exists,
    settingsCountryCode: settings.record.countryCode,
    settingsUpdatedAt: settings.record.updatedAt,
    shoppingListExists: shoppingList.exists,
    updatedAt: shoppingList.record.updatedAt,
    sharedListCount: sharedListCount.rows[0]?.count ?? 0,
  };
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
    schemaReady = undefined;
  }
};
