import type { CountryConfig, Item } from '../types';
import { extractQuantifiedItem, formatCountQuantity } from './quantity';
import { extractSize } from './size';
import { detectSection } from './sections';
import { cleanEntryName, ensureString, normalize, cleanLine, formatDisplayName, stripDisplaySizeLabel, unwrapContainerName } from './stringUtils';
import { splitInputLines } from './splitters';

export const dedupeKey = (name: unknown, quantity?: unknown, size?: unknown, quantityValue?: unknown): string =>
  `${cleanEntryName(name)}|${normalize(quantity ?? '')}|${normalize(size ?? '')}|${normalize(quantityValue ?? '')}`;

export const getStoredValue = (item: Item): string => {
  const parts = [
    item.size,
    typeof item.quantityValue === 'number' ? formatCountQuantity(item.quantityValue) : undefined,
    item.raw,
    item.quantity,
  ].filter(Boolean);
  return parts.join(' ');
};

export const getDisplayName = (item: Item): string => formatDisplayName(item.raw, item.quantityValue);

export const getDisplayValue = (item: Item): string => getDisplayName(item);

export const getSizeDisplayValue = (item: Item): string | undefined =>
  typeof item.sizeValue === 'string' ? `Size: ${item.sizeValue}` : undefined;

export const getSizeValue = (item: Item): string | undefined => item.sizeValue;

export const getQuantityDisplayValue = (item: Item): string | undefined => {
  if (typeof item.quantityValue === 'number') return `Qty: ${item.quantityValue}`;
  return undefined;
};

export const getQuantityValue = (item: Item): string | undefined => {
  if (typeof item.quantityValue === 'number') return String(item.quantityValue);
  return undefined;
};

export const getUnitQuantityDisplayValue = (item: Item): string | undefined => item.quantity;

export const getUnitQuantityValue = (item: Item): string | undefined => item.quantity;

export const parseItems = (input: unknown, config: CountryConfig | undefined, previousItems: Item[] = []): Item[] => {
  const previousMap = new Map(previousItems.map((item) => [dedupeKey(item.raw, item.quantity, item.size, item.quantityValue), item]));
  const seen = new Set<string>();
  const rawInput = ensureString(input);

  return splitInputLines(rawInput)
    .map(cleanLine)
    .filter(Boolean)
    .map((line, index) => {
      const normalizedLine = stripDisplaySizeLabel(line);
      const { quantity, quantityValue, name } = extractQuantifiedItem(normalizedLine);
      const sizeResult = extractSize(unwrapContainerName(name));
      const key = dedupeKey(sizeResult.name, quantity, sizeResult.size, quantityValue);
      if (seen.has(key)) return null;
      seen.add(key);

      const previous = previousMap.get(key);
      const cleaned = cleanEntryName(sizeResult.name);

      return {
        id: previous?.id ?? `${Date.now()}-${index}-${cleaned || 'item'}`,
        raw: sizeResult.name,
        normalized: normalize(sizeResult.name),
        cleaned,
        size: sizeResult.size,
        sizeValue: sizeResult.sizeValue,
        quantity,
        quantityValue,
        checked: previous?.checked ?? false,
        matchedSection: detectSection(sizeResult.name, config),
      } satisfies Item;
    })
    .filter(Boolean) as Item[];
};
