import { describe, expect, it } from 'vitest';
import { splitInputLines } from './splitters';

describe('input splitters', () => {
  it('splits newline, comma, and semicolon separated input', () => {
    expect(splitInputLines('milk\nbread, eggs; cheese')).toEqual(['milk', 'bread', ' eggs', ' cheese']);
  });

  it('supports Windows newlines without leaving carriage returns', () => {
    expect(splitInputLines('milk\r\nbread')).toEqual(['milk', 'bread']);
  });

  it('preserves empty segments for the parser cleanup step', () => {
    expect(splitInputLines('milk,,bread;')).toEqual(['milk', '', 'bread', '']);
  });
});
