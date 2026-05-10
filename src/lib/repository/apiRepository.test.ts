import { afterEach, describe, expect, it, vi } from 'vitest';
import { UK_CONFIG } from '../../config/countries/uk';
import { parseItems } from '../parser';
import {
  checkBackendStatus,
  clearSharedShoppingList,
  loadSharedShoppingList,
  reportUnknownProducts,
  saveSharedShoppingList,
} from './apiRepository';

const sharedListId = '019dbf30-56de-7b2b-aacc-a5ae59430d7f';

const stubBrowserApi = () => {
  vi.stubGlobal('window', {
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  });
};

describe('apiRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports connected backend status with normalized database metadata', async () => {
    stubBrowserApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            mode: 'backend',
            version: '0.16.58',
            database: {
              ok: true,
              adapter: 'postgres',
              updatedAt: '2026-04-22T01:00:00.000Z',
              sharedListCount: 3,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'connected',
      health: { ok: true, mode: 'backend', version: '0.16.58' },
      database: {
        ok: true,
        adapter: 'postgres',
        updatedAt: '2026-04-22T01:00:00.000Z',
      },
    });
  });

  it('reports backend error when health or database checks fail', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'error',
      health: { ok: false },
      database: { ok: false },
    });
  });

  it('keeps database adapter and error metadata when the backend status probe fails', async () => {
    stubBrowserApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            mode: 'backend',
            database: {
              ok: false,
              adapter: 'postgres',
              error: 'connect ECONNREFUSED ::1:54321',
              errorCode: 'ECONNREFUSED',
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'error',
      health: { ok: true, mode: 'backend' },
      database: {
        ok: false,
        adapter: 'postgres',
        error: 'connect ECONNREFUSED ::1:54321',
        errorCode: 'ECONNREFUSED',
      },
    });
  });

  it('infers JSON backend status from legacy database path metadata', async () => {
    stubBrowserApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            mode: 'backend',
            database: {
              ok: true,
              path: '/redacted/shopping-list-db.json',
              sharedListCount: 1,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(checkBackendStatus()).resolves.toMatchObject({
      state: 'connected',
      database: {
        ok: true,
        adapter: 'json',
      },
    });
  });

  it('reports offline backend status when fetch fails', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'offline',
      health: { ok: false },
      database: { ok: false },
    });
  });

  it('loads valid shared-list payloads from the backend', async () => {
    stubBrowserApi();
    const input = 'milk';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            exists: true,
            createdAt: '2026-04-22T00:00:00.000Z',
            updatedAt: '2026-04-22T01:00:00.000Z',
            record: {
              listId: sharedListId,
              serverBacked: true,
              input,
              items: parseItems(input, UK_CONFIG),
              updatedAt: '2026-04-22T01:00:00.000Z',
              countryCode: 'uk',
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(loadSharedShoppingList(sharedListId)).resolves.toMatchObject({
      exists: true,
      createdAt: '2026-04-22T00:00:00.000Z',
      updatedAt: '2026-04-22T01:00:00.000Z',
      record: {
        listId: sharedListId,
        serverBacked: true,
        input,
        countryCode: 'uk',
      },
    });
  });

  it('throws when a shared list cannot be loaded', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 404 })));

    await expect(loadSharedShoppingList(sharedListId)).rejects.toThrow('Unable to load shared shopping list: 404');
  });

  it('saves shared lists with canonical shared-list identity metadata', async () => {
    stubBrowserApi();
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const input = 'milk\nbread';
    await saveSharedShoppingList(sharedListId, {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d80',
      serverBacked: false,
      listName: 'Weekly shop',
      input,
      items: parseItems(input, UK_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk',
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/shared-lists/${sharedListId}`,
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(body).toMatchObject({
      listId: sharedListId,
      serverBacked: true,
      listName: 'Weekly shop',
      input,
      countryCode: 'uk',
    });
  });

  it('rejects malformed shared-list payloads from the backend', async () => {
    stubBrowserApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ exists: true, record: {} }), { status: 200 })),
    );

    await expect(loadSharedShoppingList(sharedListId)).rejects.toThrow(
      'Backend returned an invalid shared shopping list record',
    );
  });

  it('throws when a shared list cannot be saved or cleared', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 409 })));
    const input = 'milk';
    const record = {
      listId: sharedListId,
      serverBacked: true,
      input,
      items: parseItems(input, UK_CONFIG),
      updatedAt: '2026-04-22T00:00:00.000Z',
      countryCode: 'uk' as const,
    };

    await expect(saveSharedShoppingList(sharedListId, record)).rejects.toThrow(
      'Unable to save shared shopping list: 409',
    );
    await expect(clearSharedShoppingList(sharedListId)).rejects.toThrow('Unable to clear shared shopping list: 409');
  });

  it('clears shared lists with a DELETE request', async () => {
    stubBrowserApi();
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await clearSharedShoppingList(sharedListId);

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/shared-lists/${sharedListId}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('prepares CSRF before reporting unknown products', async () => {
    stubBrowserApi();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(reportUnknownProducts({
      countryCode: 'uk',
      locale: 'en',
      items: [{ raw: 'dragon fruit', normalized: 'dragon fruit', cleaned: 'dragon fruit' }],
    })).resolves.toEqual({ disabled: false });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/unknown-products/csrf',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/unknown-products',
      expect.objectContaining({ credentials: 'same-origin', method: 'POST' }),
    );
  });
});
