import type { CountryConfig, Item } from '../types';
import { extractQuantifiedItem, formatCountQuantity } from './quantity';
import { extractSize } from './size';
import { detectSection } from './sections';
import { cleanEntryName, correctSpelling, ensureString, normalize, cleanLine, formatDisplayName, stripDisplaySizeLabel, unwrapContainerName } from './stringUtils';
import { splitInputLines } from './splitters';
import { extractVariant } from './variant';

export const dedupeKey = (name: unknown, quantity?: unknown, size?: unknown, quantityValue?: unknown, variant?: unknown): string =>
  `${cleanEntryName(name)}|${normalize(quantity ?? '')}|${normalize(size ?? '')}|${normalize(quantityValue ?? '')}|${normalize(variant ?? '')}`;

export const getStoredValue = (item: Item): string => {
  const parts = [
    item.size,
    typeof item.quantityValue === 'number' ? formatCountQuantity(item.quantityValue) : undefined,
    item.variant,
    item.raw,
    item.quantity,
  ].filter(Boolean);
  return parts.join(' ');
};

export const getDisplayName = (item: Item): string => formatDisplayName(item.raw, item.quantityValue);

export const getDisplayValue = (item: Item): string => getDisplayName(item);

export const getVariantPrefixedDisplayValue = (item: Item): string => {
  const displayValue = getDisplayValue(item);
  const variantValue = getVariantValue(item);
  if (!variantValue) { return displayValue; }

  if (normalize(item.raw) === 'milk') {
    const milkVariantLabels = new Map([
      ['semi skimmed', 'Semi-Skimmed Milk'],
      ['whole', 'Whole Milk'],
      ['skimmed', 'Skimmed Milk'],
    ]);
    return milkVariantLabels.get(normalize(variantValue)) ?? `${variantValue} Milk`;
  }

  const normalizedDisplay = normalize(displayValue);
  const normalizedVariant = normalize(variantValue);
  if (normalizedDisplay.startsWith(`${normalizedVariant} `)) { return displayValue; }

  return `${variantValue} ${displayValue}`;
};

export const getSizeDisplayValue = (item: Item): string | undefined =>
  typeof item.sizeValue === 'string' ? `Size: ${item.sizeValue}` : undefined;

export const getSizeValue = (item: Item): string | undefined => item.sizeValue;

export const getQuantityDisplayValue = (item: Item): string | undefined => {
  if (typeof item.quantityValue === 'number') { return `Qty: ${item.quantityValue}`; }
  return undefined;
};

export const getQuantityValue = (item: Item): string | undefined => {
  if (typeof item.quantityValue === 'number') { return String(item.quantityValue); }
  return undefined;
};

export const getUnitQuantityDisplayValue = (item: Item): string | undefined => item.quantityDisplay ?? item.quantity;

export const getUnitQuantityValue = (item: Item): string | undefined => item.quantity;

export const getVariantDisplayValue = (item: Item): string | undefined =>
  item.variant ? `Variant: ${formatDisplayName(item.variant)}` : undefined;

export const getVariantValue = (item: Item): string | undefined =>
  item.variant ? formatDisplayName(item.variant) : undefined;

export const parseItems = (input: unknown, config: CountryConfig | undefined, previousItems: Item[] = []): Item[] => {
  const previousMap = new Map<string, Item>();
  for (const item of previousItems) {
    previousMap.set(dedupeKey(item.raw, item.quantity, item.size, item.quantityValue, item.variant), item);
    if (!item.variant) {
      const previousVariant = extractVariant(item.raw, config);
      if (previousVariant.variant) {
        previousMap.set(
          dedupeKey(previousVariant.name, item.quantity, item.size, item.quantityValue, previousVariant.variant),
          item,
        );
      }
    }
  }
  const seen = new Set<string>();
  const rawInput = ensureString(input);

  return splitInputLines(rawInput)
    .map(cleanLine)
    .filter(Boolean)
    .map((line, index) => {
      const normalizedLine = stripDisplaySizeLabel(line);
      const { quantity, quantityDisplay, quantityMetricValue, quantityMetricUnit, quantityValue, name } = extractQuantifiedItem(normalizedLine, config);
      const unwrappedName = unwrapContainerName(name);
      const sizeInput = /\([^)]+\)\s*$/.test(unwrappedName) ? unwrappedName : correctSpelling(unwrappedName);
      const sizeResult = extractSize(sizeInput);
      const variantResult = extractVariant(sizeResult.name, config);
      const correctedName = correctSpelling(variantResult.name);
      const correctedVariant = variantResult.variant ? correctSpelling(variantResult.variant) : undefined;
      const key = dedupeKey(correctedName, quantity, sizeResult.size, quantityValue, correctedVariant);
      if (seen.has(key)) { return null; }
      seen.add(key);

      const previous = previousMap.get(key);
      const cleaned = cleanEntryName(correctedName);

      return {
        id: previous?.id ?? `${Date.now()}-${index}-${cleaned || 'item'}`,
        raw: correctedName,
        normalized: normalize(correctedName),
        cleaned,
        size: sizeResult.size,
        sizeValue: sizeResult.sizeValue,
        quantity,
        quantityDisplay,
        quantityMetricValue,
        quantityMetricUnit,
        quantityValue,
        variant: correctedVariant,
        checked: previous?.checked ?? false,
        matchedSection: detectSection(correctedName, config),
      } satisfies Item;
    })
    .filter(Boolean) as Item[];
};
