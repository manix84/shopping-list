import type { BackendDatabaseAdapter, BackendStatus, ShoppingListRecord } from '../../types';
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
  sharedListCount?: unknown;
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
        sharedListCount: typeof database?.sharedListCount === 'number' ? database.sharedListCount : undefined,
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
