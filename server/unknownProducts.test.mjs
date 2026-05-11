import { describe, expect, it } from 'vitest';
import { productIssueTitle, unknownProductReportName } from './unknownProducts.mjs';

describe('unknown products', () => {
  it('uses cleaned product names as the reporting identity', () => {
    const item = {
      raw: 'canned tuna 4',
      normalized: 'canned tuna 4',
      cleaned: 'canned tuna',
    };

    expect(unknownProductReportName(item)).toBe('canned tuna');
    expect(productIssueTitle(item)).toBe('[PRODUCT] `canned tuna` filed under `other`');
  });

  it('falls back to normalized then raw values for the reporting identity', () => {
    expect(unknownProductReportName({
      raw: 'mystery snack',
      normalized: 'mystery snack',
      cleaned: '',
    })).toBe('mystery snack');
    expect(unknownProductReportName({
      raw: 'mystery snack',
      normalized: '',
      cleaned: '',
    })).toBe('mystery snack');
  });

  it('normalizes whitespace in product issue titles', () => {
    expect(productIssueTitle({
      raw: 'canned   tuna',
      normalized: 'canned   tuna',
      cleaned: 'canned   tuna',
    })).toBe('[PRODUCT] `canned tuna` filed under `other`');
  });

  it('escapes inline code markers in product issue titles', () => {
    expect(productIssueTitle({
      raw: 'odd ` thing',
      normalized: 'odd ` thing',
      cleaned: 'odd ` thing',
    })).toBe("[PRODUCT] `odd ' thing` filed under `other`");
  });

  it('truncates long product issue titles', () => {
    const title = productIssueTitle({
      raw: 'x'.repeat(200),
      normalized: 'x'.repeat(200),
      cleaned: 'x'.repeat(200),
    });

    expect(title).toMatch(/…` filed under `other`$/);
    expect(title.length).toBeLessThan(170);
  });
});
