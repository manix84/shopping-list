import { afterEach, describe, expect, it, vi } from 'vitest';
import { UK_CONFIG } from '../../config/countries/uk';
import { parseItems } from '../parser';
import {
  checkBackendStatus,
  clearSharedShoppingList,
  loadAppSettings,
  loadSharedShoppingList,
  saveAppSettings,
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
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, mode: 'backend' }), { status: 200 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              ok: true,
              settingsExists: true,
              settingsCountryCode: 'fr',
              settingsUpdatedAt: '2026-04-22T00:00:00.000Z',
              shoppingListExists: true,
              updatedAt: '2026-04-22T01:00:00.000Z',
              sharedListCount: 3,
            }),
            { status: 200 },
          ),
        ),
    );

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'connected',
      health: { ok: true, mode: 'backend' },
      database: {
        ok: true,
        settingsExists: true,
        settingsCountryCode: 'fr',
        settingsUpdatedAt: '2026-04-22T00:00:00.000Z',
        shoppingListExists: true,
        updatedAt: '2026-04-22T01:00:00.000Z',
        sharedListCount: 3,
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

  it('reports offline backend status when fetch fails', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(checkBackendStatus()).resolves.toEqual({
      state: 'offline',
      health: { ok: false },
      database: { ok: false },
    });
  });

  it('loads app settings with country and timestamp fallbacks', async () => {
    stubBrowserApi();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            exists: true,
            record: {
              countryCode: 'not-supported',
              updatedAt: 123,
            },
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(loadAppSettings()).resolves.toEqual({
      exists: true,
      record: {
        countryCode: 'uk',
        updatedAt: '1970-01-01T00:00:00.000Z',
      },
    });
  });

  it('throws when app settings cannot be loaded or saved', async () => {
    stubBrowserApi();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    await expect(loadAppSettings()).rejects.toThrow('Unable to load app settings: 500');
    await expect(saveAppSettings({ countryCode: 'uk', updatedAt: '2026-04-22T00:00:00.000Z' })).rejects.toThrow(
      'Unable to save app settings: 500',
    );
  });

  it('saves app settings with a PUT request', async () => {
    stubBrowserApi();
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await saveAppSettings({ countryCode: 'nl', updatedAt: '2026-04-22T00:00:00.000Z' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/settings',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ countryCode: 'nl', updatedAt: '2026-04-22T00:00:00.000Z' }),
      }),
    );
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
});
