import { COUNTRY_CONFIGS } from '../../config/countries';
import type { CountryCode, ShoppingListRecord } from '../../types';
import { parseItems } from '../parser';
import { ensureString } from '../stringUtils';

export const encodeShoppingListRecord = (record: ShoppingListRecord): string => JSON.stringify(record);

export const decodeShoppingListRecord = (
  raw: string,
  fallbackCountryCode: CountryCode = 'uk',
): ShoppingListRecord | undefined => {
  try {
    const parsed = JSON.parse(raw) as Partial<ShoppingListRecord>;
    const countryCode: CountryCode = parsed.countryCode === 'uk' ? 'uk' : fallbackCountryCode;
    const config = COUNTRY_CONFIGS[countryCode];
    const input = ensureString(parsed.input);

    return {
      input,
      items: Array.isArray(parsed.items) ? parsed.items : parseItems(input, config),
      updatedAt: ensureString(parsed.updatedAt) || new Date().toISOString(),
      countryCode,
    };
  } catch {
    return undefined;
  }
};
