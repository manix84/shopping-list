import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it, vi } from 'vitest';

const importDatabase = async () => {
  vi.resetModules();
  return import('./database.mjs');
};

describe('product suggestions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('stores unknown product suggestions and exposes approved overlays from the JSON database', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'shopping-list-products-'));
    vi.stubEnv('SHOPPING_LIST_DB_PATH', join(directory, 'database.json'));
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('SHOPPING_LIST_DATABASE_URL', '');
    const database = await importDatabase();

    const suggestion = await database.upsertUnknownProductSuggestion({
      item: {
        raw: 'Canned Tuna x2',
        normalized: 'canned tuna x2',
        cleaned: 'canned tuna',
      },
      report: {
        countryCode: 'uk',
        locale: 'en',
      },
    });

    expect(suggestion).toMatchObject({
      product: 'canned tuna',
      normalizedProduct: 'canned tuna',
      countryCode: 'uk',
      status: 'pending',
      section: 'other',
      reportCount: 1,
    });

    await database.upsertUnknownProductSuggestion({
      item: {
        raw: 'tuna',
        normalized: 'tuna',
        cleaned: 'canned tuna',
      },
      report: {
        countryCode: 'uk',
        locale: 'en',
      },
    });

    const [pending] = await database.listProductSuggestions({ status: 'pending' });
    expect(pending).toMatchObject({
      id: suggestion.id,
      reportCount: 2,
      latestRawItems: ['tuna', 'Canned Tuna x2'],
    });

    await database.updateProductSuggestion(suggestion.id, {
      product: 'canned tuna',
      aliases: ['tuna', 'tin of tuna'],
      section: 'tinned_jarred',
      status: 'approved',
    });

    await expect(database.getProductOverrides({ countryCode: 'uk' })).resolves.toEqual([
      expect.objectContaining({
        product: 'canned tuna',
        aliases: ['tuna', 'tin of tuna'],
        section: 'tinned_jarred',
        countryCode: 'uk',
      }),
    ]);
  });

  it('stores recategorization suggestions with current and suggested section evidence', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'shopping-list-products-'));
    vi.stubEnv('SHOPPING_LIST_DB_PATH', join(directory, 'database.json'));
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('SHOPPING_LIST_DATABASE_URL', '');
    const database = await importDatabase();

    const suggestion = await database.upsertUnknownProductSuggestion({
      item: {
        raw: 'dettol wipes',
        normalized: 'dettol wipes',
        cleaned: 'dettol wipes',
        matchedSection: 'baby',
        suggestedSection: 'household',
      },
      report: {
        countryCode: 'uk',
        locale: 'en',
      },
      suggestion: {
        section: 'household',
        source: 'recategorization',
        evidence: {
          currentSection: 'baby',
          suggestedSection: 'household',
        },
      },
    });

    expect(suggestion).toMatchObject({
      product: 'dettol wipes',
      section: 'household',
      source: 'recategorization',
      evidence: {
        currentSection: 'baby',
        suggestedSection: 'household',
      },
    });
  });
});
