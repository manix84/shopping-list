import { COUNTRY_CONFIGS, isCountryCode } from '../../config/countries';
import type { CountryCode, CountryConfig, Item, ShoppingListRecord } from '../../types';
import { parseItems } from '../parser';
import { ensureString } from '../stringUtils';
import { isUuidV7 } from '../uuid';

export const encodeShoppingListRecord = (record: ShoppingListRecord): string => JSON.stringify(record);
type DecodeShoppingListRecordOptions = {
  strict?: boolean;
};

const isValidItem = (value: unknown, config: CountryConfig): value is Item => {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<Item>;
  const sectionKeys = new Set(config.groups.flatMap((group) => group.sections.map((section) => section.key)));

  return (
    typeof item.id === 'string' &&
    typeof item.raw === 'string' &&
    typeof item.normalized === 'string' &&
    typeof item.cleaned === 'string' &&
    typeof item.checked === 'boolean' &&
    typeof item.matchedSection === 'string' &&
    sectionKeys.has(item.matchedSection)
  );
};

const sanitizeItems = (items: unknown, input: string, config: CountryConfig): Item[] => {
  const previousItems = Array.isArray(items) ? items.filter((item) => isValidItem(item, config)) : [];
  return parseItems(input, config, previousItems);
};

const normalizedUpdatedAt = (value: unknown): string => {
  const updatedAt = ensureString(value);
  return Number.isFinite(Date.parse(updatedAt)) ? updatedAt : new Date().toISOString();
};

export const decodeShoppingListRecord = (
  raw: string,
  fallbackCountryCode: CountryCode = 'uk',
  options: DecodeShoppingListRecordOptions = {},
): ShoppingListRecord | undefined => {
  try {
    const parsed = JSON.parse(raw) as Partial<ShoppingListRecord>;
    if (
      options.strict === true &&
      (
        typeof parsed.input !== 'string' ||
        !Array.isArray(parsed.items) ||
        !Number.isFinite(Date.parse(ensureString(parsed.updatedAt))) ||
        !isCountryCode(parsed.countryCode)
      )
    ) {
      return undefined;
    }

    const countryCode: CountryCode = isCountryCode(parsed.countryCode) ? parsed.countryCode : fallbackCountryCode;
    const config = COUNTRY_CONFIGS[countryCode];
    const input = ensureString(parsed.input);

    return {
      listId: isUuidV7(parsed.listId) ? parsed.listId : undefined,
      serverBacked: parsed.serverBacked === true,
      input,
      items: sanitizeItems(parsed.items, input, config),
      updatedAt: normalizedUpdatedAt(parsed.updatedAt),
      countryCode,
    };
  } catch {
    return undefined;
  }
};
