import { isCountryCode } from '../../config/countries';
import type { AppSettingsRecord, BackendStatus, ShoppingListRecord } from '../../types';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './recordCodec';

export type ApiShoppingListPayload = {
  record: ShoppingListRecord;
  exists: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiSettingsPayload = {
  record: AppSettingsRecord;
  exists: boolean;
};

const DEFAULT_TIMEOUT_MS = 800;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const skipBackendChecks = import.meta.env.VITE_SKIP_BACKEND_CHECKS === 'true';

const apiUrl = (path: string): string => `${apiBaseUrl}${path}`;

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

    const health = (await healthResponse.json()) as { ok?: unknown; mode?: unknown };
    const databaseResponse = await fetchWithTimeout('/api/database/status');
    const database = databaseResponse.ok
      ? ((await databaseResponse.json()) as {
          ok?: unknown;
          settingsExists?: unknown;
          settingsCountryCode?: unknown;
          settingsUpdatedAt?: unknown;
          shoppingListExists?: unknown;
          updatedAt?: unknown;
          sharedListCount?: unknown;
        })
      : undefined;

    return {
      state: databaseResponse.ok && database?.ok === true ? 'connected' : 'error',
      health: {
        ok: health.ok === true,
        mode: typeof health.mode === 'string' ? health.mode : undefined,
      },
      database: {
        ok: databaseResponse.ok && database?.ok === true,
        settingsExists: typeof database?.settingsExists === 'boolean' ? database.settingsExists : undefined,
        settingsCountryCode: isCountryCode(database?.settingsCountryCode) ? database.settingsCountryCode : undefined,
        settingsUpdatedAt: typeof database?.settingsUpdatedAt === 'string' ? database.settingsUpdatedAt : undefined,
        shoppingListExists: typeof database?.shoppingListExists === 'boolean' ? database.shoppingListExists : undefined,
        updatedAt: typeof database?.updatedAt === 'string' ? database.updatedAt : undefined,
        sharedListCount: typeof database?.sharedListCount === 'number' ? database.sharedListCount : undefined,
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
  const decoded = rawRecord ? decodeShoppingListRecord(rawRecord) : undefined;
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

export const loadAppSettings = async (): Promise<ApiSettingsPayload> => {
  const response = await fetchWithTimeout('/api/settings', {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load app settings: ${response.status}`);
  }

  const payload = (await response.json()) as {
    record?: { countryCode?: unknown; updatedAt?: unknown };
    exists?: unknown;
  };

  return {
    exists: payload.exists === true,
    record: {
      countryCode: isCountryCode(payload.record?.countryCode) ? payload.record.countryCode : 'uk',
      updatedAt: typeof payload.record?.updatedAt === 'string' ? payload.record.updatedAt : '1970-01-01T00:00:00.000Z',
    },
  };
};

export const saveAppSettings = async (record: AppSettingsRecord): Promise<void> => {
  const response = await fetchWithTimeout(
    '/api/settings',
    {
      method: 'PUT',
      body: JSON.stringify(record),
    },
    2_000,
  );

  if (!response.ok) {
    throw new Error(`Unable to save app settings: ${response.status}`);
  }
};

export const saveSharedShoppingList = async (listId: string, record: ShoppingListRecord): Promise<void> => {
  const response = await fetchWithTimeout(
    `/api/shared-lists/${listId}`,
    {
      method: 'PUT',
      body: encodeShoppingListRecord(record),
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
