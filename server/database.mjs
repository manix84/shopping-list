import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import pg from 'pg';
import './env.mjs';
import { COUNTRY_CODES, SECTION_KEYS } from './constants.mjs';
import { isEmptyShoppingListRecord } from './sharedListPolicy.mjs';

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

const PRODUCT_SUGGESTION_STATUSES = new Set(['pending', 'approved', 'rejected']);

const emptyDatabase = () => ({ sharedLists: {}, productSuggestions: {} });

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
  productSuggestions: database?.productSuggestions && typeof database.productSuggestions === 'object'
    ? database.productSuggestions
    : {},
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
  const serializedDatabase = {
    sharedLists: normalizedDatabase.sharedLists,
    productSuggestions: normalizedDatabase.productSuggestions,
  };
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

  await postgres.query(`
    CREATE TABLE IF NOT EXISTS product_suggestions (
      id uuid PRIMARY KEY,
      product text NOT NULL,
      normalized_product text NOT NULL,
      aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
      section text NOT NULL,
      country_code text NOT NULL,
      status text NOT NULL,
      confidence numeric NOT NULL,
      source text NOT NULL,
      evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
      report_count integer NOT NULL DEFAULT 0,
      latest_raw_items jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL,
      updated_at timestamptz NOT NULL,
      reviewed_at timestamptz,
      reviewed_by text,
      CONSTRAINT product_suggestions_unique_product_country UNIQUE (normalized_product, country_code)
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

const normalizeProductText = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s'-]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const productSuggestionKey = (countryCode, normalizedProduct) => `${countryCode}:${normalizedProduct}`;

const uniqueStrings = (values) => [...new Set(
  (Array.isArray(values) ? values : [])
    .map((value) => String(value ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean),
)];

const latestRawItems = (currentItems, nextItem) => uniqueStrings([nextItem, ...(Array.isArray(currentItems) ? currentItems : [])]).slice(0, 5);

const normalizeProductSuggestion = (suggestion) => {
  const now = new Date().toISOString();
  const product = String(suggestion?.product ?? '').replace(/\s+/g, ' ').trim();
  const normalizedProduct = normalizeProductText(suggestion?.normalizedProduct ?? product);
  const countryCode = COUNTRY_CODES.has(suggestion?.countryCode) ? suggestion.countryCode : 'uk';
  const section = SECTION_KEYS.has(suggestion?.section) ? suggestion.section : 'other';
  const status = PRODUCT_SUGGESTION_STATUSES.has(suggestion?.status) ? suggestion.status : 'pending';
  const confidence = Number.isFinite(Number(suggestion?.confidence))
    ? Math.min(1, Math.max(0, Number(suggestion.confidence)))
    : 0.2;

  return {
    id: isSharedListId(suggestion?.id) ? suggestion.id : uuidV7(),
    product: product || normalizedProduct,
    normalizedProduct,
    aliases: uniqueStrings(suggestion?.aliases),
    section,
    countries: [countryCode],
    countryCode,
    status,
    confidence,
    source: typeof suggestion?.source === 'string' && suggestion.source ? suggestion.source : 'unknown-report',
    evidence: suggestion?.evidence && typeof suggestion.evidence === 'object' && !Array.isArray(suggestion.evidence)
      ? suggestion.evidence
      : {},
    reportCount: Number.isInteger(suggestion?.reportCount) && suggestion.reportCount >= 0 ? suggestion.reportCount : 0,
    latestRawItems: uniqueStrings(suggestion?.latestRawItems),
    createdAt: timestampOrNow(suggestion?.createdAt ?? now),
    updatedAt: timestampOrNow(suggestion?.updatedAt ?? now),
    reviewedAt: suggestion?.reviewedAt ? timestampOrNow(suggestion.reviewedAt) : undefined,
    reviewedBy: typeof suggestion?.reviewedBy === 'string' && suggestion.reviewedBy ? suggestion.reviewedBy : undefined,
  };
};

const productSuggestionFromRow = (row) => normalizeProductSuggestion({
  id: row.id,
  product: row.product,
  normalizedProduct: row.normalized_product,
  aliases: row.aliases,
  section: row.section,
  countryCode: row.country_code,
  status: row.status,
  confidence: Number(row.confidence),
  source: row.source,
  evidence: row.evidence,
  reportCount: row.report_count,
  latestRawItems: row.latest_raw_items,
  createdAt: isoString(row.created_at),
  updatedAt: isoString(row.updated_at),
  reviewedAt: isoString(row.reviewed_at),
  reviewedBy: row.reviewed_by,
});

const productSuggestionRowSelect = `
  id,
  product,
  normalized_product,
  aliases,
  section,
  country_code,
  status,
  confidence,
  source,
  evidence,
  report_count,
  latest_raw_items,
  created_at,
  updated_at,
  reviewed_at,
  reviewed_by
`;

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

export const pruneEmptySharedLists = async () => {
  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const deletedIds = [];

      for (const [id, sharedList] of Object.entries(database.sharedLists)) {
        if (!isEmptyShoppingListRecord(normalizeRecord(sharedList?.record))) { continue; }

        delete database.sharedLists[id];
        deletedIds.push(id);
      }

      if (deletedIds.length > 0) {
        await writeJsonDatabase(database);
      }

      return {
        deletedCount: deletedIds.length,
        deletedIds,
      };
    });
  }

  const result = await postgresQuery(`
    DELETE FROM shared_lists
    WHERE btrim(coalesce(record->>'input', '')) = ''
      AND jsonb_typeof(record->'items') = 'array'
      AND jsonb_array_length(record->'items') = 0
    RETURNING id
  `);
  const deletedIds = result.rows.map((row) => row.id);
  return {
    deletedCount: deletedIds.length,
    deletedIds,
  };
};

export const upsertUnknownProductSuggestion = async ({ item, report, suggestion = {} }) => {
  const product = normalizeProductText(suggestion.product ?? item?.cleaned ?? item?.normalized ?? item?.raw);
  if (!product || !COUNTRY_CODES.has(report?.countryCode)) {
    return undefined;
  }

  const now = new Date().toISOString();
  const shouldReopenForReview = suggestion.source === 'recategorization' || SECTION_KEYS.has(item?.suggestedSection);
  const aliases = uniqueStrings([
    suggestion.product,
    item?.cleaned,
    item?.normalized,
    item?.raw,
    ...(Array.isArray(suggestion.aliases) ? suggestion.aliases : []),
  ]).filter((alias) => normalizeProductText(alias) !== product);
  const section = SECTION_KEYS.has(suggestion.section)
    ? suggestion.section
    : SECTION_KEYS.has(item?.suggestedSection)
      ? item.suggestedSection
      : 'other';
  const confidence = Number.isFinite(Number(suggestion.confidence))
    ? Math.min(1, Math.max(0, Number(suggestion.confidence)))
    : 0.2;

  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const key = productSuggestionKey(report.countryCode, product);
      const existing = normalizeProductSuggestion(database.productSuggestions[key]);
      const nextStatus = shouldReopenForReview ? 'pending' : existing.status;
      const next = normalizeProductSuggestion({
        ...existing,
        id: database.productSuggestions[key]?.id ?? uuidV7(),
        product: existing.product || product,
        normalizedProduct: product,
        aliases: uniqueStrings([...existing.aliases, ...aliases]),
        section: nextStatus === 'pending' ? section : existing.section,
        countryCode: report.countryCode,
        status: nextStatus,
        confidence: Math.max(existing.confidence, confidence),
        source: suggestion.source ?? existing.source ?? 'unknown-report',
        evidence: {
          ...existing.evidence,
          ...(suggestion.evidence && typeof suggestion.evidence === 'object' ? suggestion.evidence : {}),
          locale: report.locale,
          currentSection: item?.matchedSection,
          suggestedSection: item?.suggestedSection,
        },
        reportCount: existing.reportCount + 1,
        latestRawItems: latestRawItems(existing.latestRawItems, item?.raw),
        createdAt: database.productSuggestions[key]?.createdAt ?? now,
        updatedAt: now,
        reviewedAt: nextStatus === 'pending' ? undefined : existing.reviewedAt,
        reviewedBy: nextStatus === 'pending' ? undefined : existing.reviewedBy,
      });
      database.productSuggestions[key] = next;
      await writeJsonDatabase(database);
      return next;
    });
  }

  const result = await postgresQuery(
    `
      INSERT INTO product_suggestions (
        id,
        product,
        normalized_product,
        aliases,
        section,
        country_code,
        status,
        confidence,
        source,
        evidence,
        report_count,
        latest_raw_items,
        created_at,
        updated_at
      )
      VALUES ($1::uuid, $2, $3, $4::jsonb, $5, $6, 'pending', $7, $8, $9::jsonb, 1, $10::jsonb, $11::timestamptz, $11::timestamptz)
      ON CONFLICT (normalized_product, country_code) DO UPDATE SET
        aliases = coalesce((
          SELECT jsonb_agg(alias)
          FROM (
            SELECT DISTINCT jsonb_array_elements_text(product_suggestions.aliases || EXCLUDED.aliases) AS alias
          ) aliases
        ), '[]'::jsonb),
        section = CASE WHEN product_suggestions.status = 'pending' OR EXCLUDED.source = 'recategorization' THEN EXCLUDED.section ELSE product_suggestions.section END,
        status = CASE WHEN EXCLUDED.source = 'recategorization' THEN 'pending' ELSE product_suggestions.status END,
        confidence = GREATEST(product_suggestions.confidence, EXCLUDED.confidence),
        evidence = product_suggestions.evidence || EXCLUDED.evidence,
        report_count = product_suggestions.report_count + 1,
        latest_raw_items = (
          SELECT jsonb_agg(raw_item)
          FROM (
            SELECT DISTINCT jsonb_array_elements_text(EXCLUDED.latest_raw_items || product_suggestions.latest_raw_items) AS raw_item
            LIMIT 5
          ) raw_items
        ),
        updated_at = EXCLUDED.updated_at,
        reviewed_at = CASE WHEN EXCLUDED.source = 'recategorization' THEN NULL ELSE product_suggestions.reviewed_at END,
        reviewed_by = CASE WHEN EXCLUDED.source = 'recategorization' THEN NULL ELSE product_suggestions.reviewed_by END
      RETURNING ${productSuggestionRowSelect}
    `,
    [
      uuidV7(),
      product,
      product,
      JSON.stringify(aliases),
      section,
      report.countryCode,
      confidence,
      suggestion.source ?? 'unknown-report',
      JSON.stringify({
        ...(suggestion.evidence && typeof suggestion.evidence === 'object' ? suggestion.evidence : {}),
        locale: report.locale,
        currentSection: item?.matchedSection,
        suggestedSection: item?.suggestedSection,
      }),
      JSON.stringify(latestRawItems([], item?.raw)),
      now,
    ],
  );

  return productSuggestionFromRow(result.rows[0]);
};

export const listProductSuggestions = async ({ status } = {}) => {
  if (!getPool()) {
    const database = await readJsonDatabase();
    return Object.values(database.productSuggestions)
      .map(normalizeProductSuggestion)
      .filter((suggestion) => !status || suggestion.status === status)
      .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
  }

  const params = [];
  const where = PRODUCT_SUGGESTION_STATUSES.has(status) ? 'WHERE status = $1' : '';
  if (where) { params.push(status); }
  const result = await postgresQuery(
    `
      SELECT ${productSuggestionRowSelect}
      FROM product_suggestions
      ${where}
      ORDER BY updated_at DESC
    `,
    params,
  );
  return result.rows.map(productSuggestionFromRow);
};

export const getProductOverrides = async ({ countryCode } = {}) => {
  if (!COUNTRY_CODES.has(countryCode)) { return []; }
  const suggestions = await listProductSuggestions({ status: 'approved' });
  return suggestions
    .filter((suggestion) => suggestion.countryCode === countryCode)
    .map((suggestion) => ({
      id: suggestion.id,
      product: suggestion.product,
      aliases: suggestion.aliases,
      section: suggestion.section,
      countryCode: suggestion.countryCode,
      updatedAt: suggestion.updatedAt,
    }));
};

export const updateProductSuggestion = async (id, updates = {}) => {
  const allowedUpdates = {
    product: typeof updates.product === 'string' && updates.product.trim() ? updates.product.trim() : undefined,
    aliases: Array.isArray(updates.aliases) ? uniqueStrings(updates.aliases) : undefined,
    section: SECTION_KEYS.has(updates.section) ? updates.section : undefined,
    countryCode: COUNTRY_CODES.has(updates.countryCode) ? updates.countryCode : undefined,
    status: PRODUCT_SUGGESTION_STATUSES.has(updates.status) ? updates.status : undefined,
  };
  const now = new Date().toISOString();

  if (!getPool()) {
    return withJsonDatabaseWriteLock(async () => {
      const database = await readJsonDatabase();
      const entry = Object.entries(database.productSuggestions).find(([, suggestion]) => suggestion?.id === id);
      if (!entry) { return undefined; }

      const [key, currentRaw] = entry;
      const current = normalizeProductSuggestion(currentRaw);
      const nextProduct = allowedUpdates.product ?? current.product;
      const nextCountryCode = allowedUpdates.countryCode ?? current.countryCode;
      const nextNormalizedProduct = normalizeProductText(nextProduct);
      const next = normalizeProductSuggestion({
        ...current,
        product: nextProduct,
        normalizedProduct: nextNormalizedProduct,
        aliases: allowedUpdates.aliases ?? current.aliases,
        section: allowedUpdates.section ?? current.section,
        countryCode: nextCountryCode,
        status: allowedUpdates.status ?? current.status,
        updatedAt: now,
        reviewedAt: allowedUpdates.status && allowedUpdates.status !== 'pending' ? now : current.reviewedAt,
      });
      const nextKey = productSuggestionKey(nextCountryCode, nextNormalizedProduct);
      delete database.productSuggestions[key];
      database.productSuggestions[nextKey] = next;
      await writeJsonDatabase(database);
      return next;
    });
  }

  const currentResult = await postgresQuery(`SELECT ${productSuggestionRowSelect} FROM product_suggestions WHERE id = $1::uuid`, [id]);
  const current = currentResult.rows[0] ? productSuggestionFromRow(currentResult.rows[0]) : undefined;
  if (!current) { return undefined; }

  const nextProduct = allowedUpdates.product ?? current.product;
  const nextCountryCode = allowedUpdates.countryCode ?? current.countryCode;
  const nextStatus = allowedUpdates.status ?? current.status;
  const result = await postgresQuery(
    `
      UPDATE product_suggestions
      SET
        product = $2,
        normalized_product = $3,
        aliases = $4::jsonb,
        section = $5,
        country_code = $6,
        status = $7,
        updated_at = $8::timestamptz,
        reviewed_at = CASE WHEN $7 != 'pending' THEN $8::timestamptz ELSE reviewed_at END
      WHERE id = $1::uuid
      RETURNING ${productSuggestionRowSelect}
    `,
    [
      id,
      nextProduct,
      normalizeProductText(nextProduct),
      JSON.stringify(allowedUpdates.aliases ?? current.aliases),
      allowedUpdates.section ?? current.section,
      nextCountryCode,
      nextStatus,
      now,
    ],
  );
  return result.rows[0] ? productSuggestionFromRow(result.rows[0]) : undefined;
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
    };
  }

  let sharedLists;
  try {
    sharedLists = await postgresQuery('SELECT MAX(updated_at) AS updated_at FROM shared_lists');
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
  };
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
    schemaReady = undefined;
  }
};
