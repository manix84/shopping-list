import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const DEFAULT_RECORD = {
  input: '',
  items: [],
  updatedAt: '1970-01-01T00:00:00.000Z',
  countryCode: 'uk',
};

const databasePath = resolve(process.env.SHOPPING_LIST_DB_PATH ?? 'data/shopping-list-db.json');
let databaseWriteQueue = Promise.resolve();

const emptyDatabase = () => ({
  shoppingList: {
    exists: false,
    record: DEFAULT_RECORD,
  },
  sharedLists: {},
});

const normalizeDatabase = (database) => ({
  ...emptyDatabase(),
  ...database,
  sharedLists: database?.sharedLists && typeof database.sharedLists === 'object' ? database.sharedLists : {},
});

const readDatabase = async () => {
  try {
    const raw = await readFile(databasePath, 'utf8');
    try {
      return normalizeDatabase(JSON.parse(raw));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;

      const corruptPath = `${databasePath}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      await rename(databasePath, corruptPath);
      console.warn(`Database JSON was invalid. Moved corrupt file to ${corruptPath} and started with an empty database.`);
      return emptyDatabase();
    }
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyDatabase();
    throw error;
  }
};

const withDatabaseWriteLock = async (callback) => {
  const run = databaseWriteQueue.then(callback);
  databaseWriteQueue = run.catch(() => {});
  return run;
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

const writeDatabase = async (database) => {
  await mkdir(dirname(databasePath), { recursive: true });
  const temporaryPath = `${databasePath}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, databasePath);
};

export const getShoppingList = async () => {
  const database = await readDatabase();
  return database.shoppingList;
};

export const saveShoppingList = async (record) =>
  withDatabaseWriteLock(async () => {
    const database = await readDatabase();
    database.shoppingList = {
      exists: true,
      record,
    };
    await writeDatabase(database);
    return database.shoppingList;
  });

export const createSharedList = async (record) =>
  withDatabaseWriteLock(async () => {
    const database = await readDatabase();
    const id = uuidV7();
    const now = new Date().toISOString();

    database.sharedLists[id] = {
      id,
      exists: true,
      record,
      createdAt: now,
      updatedAt: record.updatedAt || now,
    };

    await writeDatabase(database);
    return database.sharedLists[id];
  });

export const getSharedList = async (id) => {
  const database = await readDatabase();
  return database.sharedLists[id] ?? {
    id,
    exists: false,
    record: DEFAULT_RECORD,
  };
};

export const saveSharedList = async (id, record) =>
  withDatabaseWriteLock(async () => {
    const database = await readDatabase();
    const existing = database.sharedLists[id];
    const now = new Date().toISOString();

    database.sharedLists[id] = {
      id,
      exists: true,
      record,
      createdAt: existing?.createdAt ?? now,
      updatedAt: record.updatedAt || now,
    };

    await writeDatabase(database);
    return database.sharedLists[id];
  });

export const clearSharedList = async (id) =>
  withDatabaseWriteLock(async () => {
    const database = await readDatabase();
    const existing = database.sharedLists[id];

    database.sharedLists[id] = {
      id,
      exists: false,
      record: DEFAULT_RECORD,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await writeDatabase(database);
    return database.sharedLists[id];
  });

export const clearShoppingList = async () =>
  withDatabaseWriteLock(async () => {
    const database = await readDatabase();
    database.shoppingList = {
      exists: false,
      record: DEFAULT_RECORD,
    };
    await writeDatabase(database);
    return database.shoppingList;
  });

export const getDatabaseStatus = async () => {
  const database = await readDatabase();
  const shoppingList = database.shoppingList;

  return {
    ok: true,
    path: databasePath,
    shoppingListExists: shoppingList.exists,
    updatedAt: shoppingList.record.updatedAt,
    sharedListCount: Object.keys(database.sharedLists).length,
  };
};
