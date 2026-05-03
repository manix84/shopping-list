import { afterEach, describe, expect, it, vi } from 'vitest';
import { UK_CONFIG } from '../../config/countries/uk';
import { parseItems } from '../parser';
import { loadSharedShoppingList, saveSharedShoppingList } from './apiRepository';

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
});
