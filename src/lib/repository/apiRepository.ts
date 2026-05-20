import type { BackendDatabaseAdapter, CountryCode, Item, BackendStatus, ProductOverride, ProductSuggestion, SectionKey, ShoppingListRecord } from '../../types';
import type { LocaleCode } from '../i18n/types';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './recordCodec';

export type ApiShoppingListPayload = {
  record: ShoppingListRecord;
  exists: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_TIMEOUT_MS = 800;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const skipBackendChecks = import.meta.env.VITE_SKIP_BACKEND_CHECKS === 'true';

const apiUrl = (path: string): string => `${apiBaseUrl}${path}`;
const isBackendDatabaseAdapter = (value: unknown): value is BackendDatabaseAdapter => value === 'json' || value === 'postgres';
const backendDatabaseAdapter = (value: unknown, legacyPath: unknown): BackendDatabaseAdapter | undefined => {
  if (isBackendDatabaseAdapter(value)) { return value; }
  return typeof legacyPath === 'string' ? 'json' : undefined;
};

const fetchWithTimeout = async (path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

type ApiDatabaseStatusPayload = {
  ok?: unknown;
  adapter?: unknown;
  path?: unknown;
  updatedAt?: unknown;
  error?: unknown;
  errorCode?: unknown;
};

export const checkBackendStatus = async (): Promise<BackendStatus> => {
  if (skipBackendChecks) {
    return {
      state: 'offline',
      health: { ok: false },
      database: { ok: false },
    };
  }

  try {
    const healthResponse = await fetchWithTimeout('/api/health');
    if (!healthResponse.ok) {
      return {
        state: 'error',
        health: { ok: false },
        database: { ok: false },
      };
    }

    const health = (await healthResponse.json()) as {
      ok?: unknown;
      mode?: unknown;
      version?: unknown;
      database?: ApiDatabaseStatusPayload;
    };
    const database = health.database;

    return {
      state: health.ok === true && database?.ok === true ? 'connected' : 'error',
      health: {
        ok: health.ok === true,
        mode: typeof health.mode === 'string' ? health.mode : undefined,
        version: typeof health.version === 'string' ? health.version : undefined,
      },
      database: {
        ok: health.ok === true && database?.ok === true,
        adapter: backendDatabaseAdapter(database?.adapter, database?.path),
        updatedAt: typeof database?.updatedAt === 'string' ? database.updatedAt : undefined,
        error: typeof database?.error === 'string' ? database.error : undefined,
        errorCode: typeof database?.errorCode === 'string' ? database.errorCode : undefined,
      },
    };
  } catch {
    return {
      state: 'offline',
      health: { ok: false },
      database: { ok: false },
    };
  }
};

export const loadSharedShoppingList = async (listId: string): Promise<ApiShoppingListPayload> => {
  const response = await fetchWithTimeout(`/api/shared-lists/${listId}`, {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load shared shopping list: ${response.status}`);
  }

  const payload = (await response.json()) as { record?: unknown; exists?: unknown; createdAt?: unknown; updatedAt?: unknown };
  const rawRecord = JSON.stringify(payload.record);
  const decoded = rawRecord ? decodeShoppingListRecord(rawRecord, 'uk', { strict: true }) : undefined;
  if (!decoded) {
    throw new Error('Backend returned an invalid shared shopping list record');
  }

  return {
    record: decoded,
    exists: payload.exists === true,
    createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : undefined,
    updatedAt: typeof payload.updatedAt === 'string' ? payload.updatedAt : undefined,
  };
};

export const sharedShoppingListEventsUrl = (listId: string): string =>
  apiUrl(`/api/shared-lists/${listId}/events`);

export const saveSharedShoppingList = async (listId: string, record: ShoppingListRecord): Promise<void> => {
  const sharedRecord: ShoppingListRecord = {
    ...record,
    listId,
    serverBacked: true,
  };
  const response = await fetchWithTimeout(
    `/api/shared-lists/${listId}`,
    {
      method: 'PUT',
      body: encodeShoppingListRecord(sharedRecord),
    },
    2_000,
  );

  if (!response.ok) {
    throw new Error(`Unable to save shared shopping list: ${response.status}`);
  }
};

export const clearSharedShoppingList = async (listId: string): Promise<void> => {
  const response = await fetchWithTimeout(`/api/shared-lists/${listId}`, { method: 'DELETE' }, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to clear shared shopping list: ${response.status}`);
  }
};

export type UnknownProductsReport = {
  countryCode: CountryCode;
  locale: LocaleCode;
  items: Pick<Item, 'raw' | 'normalized' | 'cleaned'>[];
};

export const reportUnknownProducts = async (report: UnknownProductsReport): Promise<{ disabled: boolean }> => {
  const csrfResponse = await fetchWithTimeout(
    '/api/unknown-products/csrf',
    { credentials: 'same-origin' },
    2_000,
  );

  if (!csrfResponse.ok) {
    throw new Error(`Unable to prepare unknown product report: ${csrfResponse.status}`);
  }

  const response = await fetchWithTimeout(
    '/api/unknown-products',
    {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify(report),
    },
    2_000,
  );

  if (response.status === 401) {
    return { disabled: true };
  }

  if (!response.ok) {
    throw new Error(`Unable to report unknown products: ${response.status}`);
  }

  const payload = (await response.json()) as { disabled?: unknown };
  return { disabled: payload.disabled === true };
};

const isSectionKey = (value: unknown): value is SectionKey => typeof value === 'string';

const isCountryCode = (value: unknown): value is CountryCode =>
  ['be', 'ca', 'de', 'es', 'fr', 'it', 'mx', 'nl', 'ro', 'uk', 'us'].includes(String(value));

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const decodeProductSuggestion = (value: unknown): ProductSuggestion | undefined => {
  if (!value || typeof value !== 'object') { return undefined; }
  const suggestion = value as Record<string, unknown>;
  if (
    typeof suggestion.id !== 'string' ||
    typeof suggestion.product !== 'string' ||
    typeof suggestion.normalizedProduct !== 'string' ||
    !isSectionKey(suggestion.section) ||
    !isCountryCode(suggestion.countryCode) ||
    (suggestion.status !== 'pending' && suggestion.status !== 'approved' && suggestion.status !== 'rejected')
  ) {
    return undefined;
  }

  return {
    id: suggestion.id,
    product: suggestion.product,
    normalizedProduct: suggestion.normalizedProduct,
    aliases: stringArray(suggestion.aliases),
    section: suggestion.section,
    countries: stringArray(suggestion.countries).filter(isCountryCode),
    countryCode: suggestion.countryCode,
    status: suggestion.status,
    confidence: typeof suggestion.confidence === 'number' ? suggestion.confidence : Number(suggestion.confidence) || 0,
    source: typeof suggestion.source === 'string' ? suggestion.source : 'unknown-report',
    evidence: suggestion.evidence && typeof suggestion.evidence === 'object' && !Array.isArray(suggestion.evidence)
      ? suggestion.evidence as Record<string, unknown>
      : {},
    reportCount: typeof suggestion.reportCount === 'number' ? suggestion.reportCount : Number(suggestion.reportCount) || 0,
    latestRawItems: stringArray(suggestion.latestRawItems),
    createdAt: typeof suggestion.createdAt === 'string' ? suggestion.createdAt : '',
    updatedAt: typeof suggestion.updatedAt === 'string' ? suggestion.updatedAt : '',
    reviewedAt: typeof suggestion.reviewedAt === 'string' ? suggestion.reviewedAt : undefined,
    reviewedBy: typeof suggestion.reviewedBy === 'string' ? suggestion.reviewedBy : undefined,
  };
};

const decodeProductOverride = (value: unknown): ProductOverride | undefined => {
  if (!value || typeof value !== 'object') { return undefined; }
  const override = value as Record<string, unknown>;
  if (
    typeof override.id !== 'string' ||
    typeof override.product !== 'string' ||
    !isSectionKey(override.section) ||
    !isCountryCode(override.countryCode)
  ) {
    return undefined;
  }

  return {
    id: override.id,
    product: override.product,
    aliases: stringArray(override.aliases),
    section: override.section,
    countryCode: override.countryCode,
    updatedAt: typeof override.updatedAt === 'string' ? override.updatedAt : '',
  };
};

export const loadProductOverrides = async (countryCode: CountryCode): Promise<ProductOverride[]> => {
  const response = await fetchWithTimeout(`/api/product-overrides?country=${encodeURIComponent(countryCode)}`, {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load product overrides: ${response.status}`);
  }

  const payload = (await response.json()) as { overrides?: unknown };
  return Array.isArray(payload.overrides)
    ? payload.overrides.map(decodeProductOverride).filter((override): override is ProductOverride => Boolean(override))
    : [];
};

export const loadProductSuggestions = async (status = 'pending'): Promise<ProductSuggestion[]> => {
  const response = await fetchWithTimeout(`/api/unknown-products/suggestions?status=${encodeURIComponent(status)}`, {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load product suggestions: ${response.status}`);
  }

  const payload = (await response.json()) as { suggestions?: unknown };
  return Array.isArray(payload.suggestions)
    ? payload.suggestions.map(decodeProductSuggestion).filter((suggestion): suggestion is ProductSuggestion => Boolean(suggestion))
    : [];
};

export const approveProductSuggestion = async (
  id: string,
  updates: Pick<ProductSuggestion, 'product' | 'aliases' | 'section' | 'countryCode'>,
): Promise<ProductSuggestion> => {
  const response = await fetchWithTimeout(
    `/api/unknown-products/suggestions/${id}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(updates),
    },
    2_000,
  );
  if (!response.ok) {
    throw new Error(`Unable to approve product suggestion: ${response.status}`);
  }

  const payload = (await response.json()) as { suggestion?: unknown };
  const suggestion = decodeProductSuggestion(payload.suggestion);
  if (!suggestion) {
    throw new Error('Backend returned an invalid product suggestion');
  }
  return suggestion;
};

export const rejectProductSuggestion = async (id: string): Promise<ProductSuggestion> => {
  const response = await fetchWithTimeout(
    `/api/unknown-products/suggestions/${id}/reject`,
    { method: 'POST' },
    2_000,
  );
  if (!response.ok) {
    throw new Error(`Unable to reject product suggestion: ${response.status}`);
  }

  const payload = (await response.json()) as { suggestion?: unknown };
  const suggestion = decodeProductSuggestion(payload.suggestion);
  if (!suggestion) {
    throw new Error('Backend returned an invalid product suggestion');
  }
  return suggestion;
};
