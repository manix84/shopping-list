import type { BackendStatus, ShoppingListRecord } from '../../types';
import { decodeShoppingListRecord, encodeShoppingListRecord } from './recordCodec';
import type { ShoppingListRepository } from './storage';

export type ApiShoppingListPayload = {
  record: ShoppingListRecord;
  exists: boolean;
};

const DEFAULT_TIMEOUT_MS = 800;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

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

export const isApiAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout('/api/health');
    return response.ok;
  } catch {
    return false;
  }
};

export const checkBackendStatus = async (): Promise<BackendStatus> => {
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

export const loadApiShoppingList = async (): Promise<ApiShoppingListPayload> => {
  const response = await fetchWithTimeout('/api/shopping-list', {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load backend shopping list: ${response.status}`);
  }

  const payload = (await response.json()) as { record?: unknown; exists?: unknown };
  const rawRecord = JSON.stringify(payload.record);
  const decoded = rawRecord ? decodeShoppingListRecord(rawRecord) : undefined;
  if (!decoded) {
    throw new Error('Backend returned an invalid shopping list record');
  }

  return {
    record: decoded,
    exists: payload.exists === true,
  };
};

export const loadSharedShoppingList = async (listId: string): Promise<ApiShoppingListPayload> => {
  const response = await fetchWithTimeout(`/api/shared-lists/${listId}`, {}, 2_000);
  if (!response.ok) {
    throw new Error(`Unable to load shared shopping list: ${response.status}`);
  }

  const payload = (await response.json()) as { record?: unknown; exists?: unknown };
  const rawRecord = JSON.stringify(payload.record);
  const decoded = rawRecord ? decodeShoppingListRecord(rawRecord) : undefined;
  if (!decoded) {
    throw new Error('Backend returned an invalid shared shopping list record');
  }

  return {
    record: decoded,
    exists: payload.exists === true,
  };
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

export const createSharedShoppingList = async (record: ShoppingListRecord): Promise<string> => {
  const response = await fetchWithTimeout(
    '/api/shared-lists',
    {
      method: 'POST',
      body: JSON.stringify({ record }),
    },
    2_000,
  );

  if (!response.ok) {
    throw new Error(`Unable to create shared shopping list: ${response.status}`);
  }

  const payload = (await response.json()) as { id?: unknown };
  if (typeof payload.id !== 'string') {
    throw new Error('Backend did not return a shared list id');
  }

  return payload.id;
};

export const apiRepository: ShoppingListRepository = {
  load: async () => {
    const payload = await loadApiShoppingList();
    return payload.record;
  },
  save: async (record) => {
    const response = await fetchWithTimeout(
      '/api/shopping-list',
      {
        method: 'PUT',
        body: encodeShoppingListRecord(record),
      },
      2_000,
    );

    if (!response.ok) {
      throw new Error(`Unable to save backend shopping list: ${response.status}`);
    }
  },
  clear: async () => {
    const response = await fetchWithTimeout('/api/shopping-list', { method: 'DELETE' }, 2_000);
    if (!response.ok) {
      throw new Error(`Unable to clear backend shopping list: ${response.status}`);
    }
  },
};
