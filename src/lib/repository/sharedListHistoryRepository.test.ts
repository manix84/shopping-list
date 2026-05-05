import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../../test/testUtils';
import { sharedListHistoryRepository, STORAGE_KEY } from './sharedListHistoryRepository';

describe('sharedListHistoryRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('remembers and removes history entries', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    const first = {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
      listName: 'Weekend shop',
      itemPreview: ['milk', 'bread', 'apples', 'coffee'],
      createdAt: '2026-04-22T00:00:00.000Z',
      updatedAt: '2026-04-22T00:00:00.000Z',
      viewedAt: '2026-04-22T00:00:00.000Z',
    };
    const second = {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d80',
      itemPreview: ['bananas', 'tea'],
      createdAt: '2026-04-23T00:00:00.000Z',
      updatedAt: '2026-04-23T00:00:00.000Z',
      viewedAt: '2026-04-23T00:00:00.000Z',
    };

    sharedListHistoryRepository.remember(first);
    const remembered = sharedListHistoryRepository.remember(second);

    expect(remembered).toHaveLength(2);
    expect(remembered[0].listId).toBe(second.listId);
    expect(remembered[1].listName).toBe(first.listName);
    expect(remembered[1].itemPreview).toEqual(first.itemPreview);
    expect(windowMock.localStorage.getItem(STORAGE_KEY)).toContain(second.listId);

    const remaining = sharedListHistoryRepository.remove(second.listId);
    expect(remaining).toEqual([
      expect.objectContaining({
        listId: first.listId,
      }),
    ]);
  });

  it('updates an existing history entry while preserving its created timestamp', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    const original = {
      listId: '019dbf30-56de-7b2b-aacc-a5ae59430d7f',
      listName: 'Weekend shop',
      itemPreview: ['milk', 'bread'],
      createdAt: '2026-04-22T00:00:00.000Z',
      updatedAt: '2026-04-22T00:00:00.000Z',
      viewedAt: '2026-04-22T00:00:00.000Z',
    };

    sharedListHistoryRepository.remember(original);
    const remembered = sharedListHistoryRepository.remember({
      listId: original.listId,
      listName: 'Party shop',
      itemPreview: ['crisps', 'dip'],
      updatedAt: '2026-04-23T00:00:00.000Z',
      viewedAt: '2026-04-23T00:00:00.000Z',
    });

    expect(remembered).toEqual([
      expect.objectContaining({
        listId: original.listId,
        listName: 'Party shop',
        itemPreview: ['crisps', 'dip'],
        createdAt: original.createdAt,
        updatedAt: '2026-04-23T00:00:00.000Z',
      }),
    ]);
  });
});
