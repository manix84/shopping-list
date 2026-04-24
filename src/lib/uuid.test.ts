import { describe, expect, it } from 'vitest';
import { createUuidV7, isUuidV7 } from './uuid';

describe('uuid helpers', () => {
  it('generates UUIDv7-style identifiers', () => {
    const id = createUuidV7();
    expect(isUuidV7(id)).toBe(true);
    expect(id[14]).toBe('7');
  });

  it('rejects non-v7 identifiers', () => {
    expect(isUuidV7('not-a-uuid')).toBe(false);
    expect(isUuidV7('019dbf30-56de-4b2b-aacc-a5ae59430d7f')).toBe(false);
  });
});
