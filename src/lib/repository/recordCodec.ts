import { COUNTRY_CONFIGS, isCountryCode } from '../../config/countries';
import type { CountryCode, ShoppingListRecord } from '../../types';
import { parseItems } from '../parser';
import { ensureString } from '../stringUtils';
import { isUuidV7 } from '../uuid';

export const encodeShoppingListRecord = (record: ShoppingListRecord): string => JSON.stringify(record);

export const decodeShoppingListRecord = (
  raw: string,
  fallbackCountryCode: CountryCode = 'uk',
): ShoppingListRecord | undefined => {
  try {
    const parsed = JSON.parse(raw) as Partial<ShoppingListRecord>;
    const countryCode: CountryCode = isCountryCode(parsed.countryCode) ? parsed.countryCode : fallbackCountryCode;
    const config = COUNTRY_CONFIGS[countryCode];
    const input = ensureString(parsed.input);

    return {
      listId: isUuidV7(parsed.listId) ? parsed.listId : undefined,
      serverBacked: parsed.serverBacked === true,
      input,
      items: Array.isArray(parsed.items) ? parsed.items : parseItems(input, config),
      updatedAt: ensureString(parsed.updatedAt) || new Date().toISOString(),
      countryCode,
    };
  } catch {
    return undefined;
  }
};
