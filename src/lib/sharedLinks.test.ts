import { describe, expect, it } from 'vitest';
import { extractSharedListId } from './sharedLinks';

const LIST_ID = '019dbf30-56de-7b2b-aacc-a5ae59430d7f';

describe('shared link parsing', () => {
  it('accepts a raw uuid', () => {
    expect(extractSharedListId(LIST_ID)).toBe(LIST_ID);
  });

  it('accepts canonical shared list paths', () => {
    expect(extractSharedListId(`http://localhost:5173/list/${LIST_ID}/edit`)).toBe(LIST_ID);
  });

  it('rejects URLs from another origin when one is required', () => {
    expect(extractSharedListId(`https://example.com/list/${LIST_ID}/edit`, '', 'http://localhost:5173')).toBeUndefined();
  });

  it('rejects URLs outside the configured base path', () => {
    expect(extractSharedListId(`http://localhost:5173/list/${LIST_ID}/edit`, '/app', 'http://localhost:5173')).toBeUndefined();
  });

  it('accepts short shared list paths', () => {
    expect(extractSharedListId(`http://localhost:5173/${LIST_ID}`)).toBe(LIST_ID);
  });

  it('rejects hash-based shared list paths', () => {
    expect(extractSharedListId(`https://example.com/#/list/${LIST_ID}/route`)).toBeUndefined();
  });

  it('rejects unrelated values', () => {
    expect(extractSharedListId('not-a-shared-link')).toBeUndefined();
    expect(extractSharedListId('https://example.com/list/not-a-uuid')).toBeUndefined();
  });
});
