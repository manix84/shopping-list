import { cleanLine, normalize } from './stringUtils';

export const formatCountQuantity = (value: number): string => `x${value}`;

export const parseQuantityValue = (quantity: unknown): number | undefined => {
  const cleanedQuantity = normalize(quantity);

  let match = cleanedQuantity.match(/^x\s*(\d+(?:\.\d+)?)$/i);
  if (match) return Number(match[1]);

  match = cleanedQuantity.match(/^(\d+(?:\.\d+)?)\s*x$/i);
  if (match) return Number(match[1]);

  match = cleanedQuantity.match(/^(\d+(?:\.\d+)?)$/i);
  if (match) return Number(match[1]);

  return undefined;
};

export const extractQuantity = (value: unknown): { quantity?: string; quantityValue?: number; name: string } => {
  const trimmed = cleanLine(value);

  let match = trimmed.match(/^(\d+)\s*x\s+(.+)$/i);
  if (match) {
    const quantityValue = Number(match[1]);
    return { quantity: formatCountQuantity(quantityValue), quantityValue, name: match[2] };
  }

  match = trimmed.match(/^(x\s*\d+)\s+(.+)$/i);
  if (match) {
    const quantityValue = parseQuantityValue(match[1]);
    return { quantity: formatCountQuantity(quantityValue ?? 0), quantityValue, name: match[2] };
  }

  match = trimmed.match(/^(.+?)\s+x\s*(\d+)$/i);
  if (match) {
    const quantityValue = Number(match[2]);
    return { quantity: formatCountQuantity(quantityValue), quantityValue, name: match[1] };
  }

  match = trimmed.match(/^(\d+(?:\.\d+)?[a-zA-Z]+)\s+(.+)$/i);
  if (match) {
    return { quantity: match[1], name: match[2] };
  }

  match = trimmed.match(/^(\d+)\s+(.+)$/i);
  if (match) {
    const quantityValue = Number(match[1]);
    return { quantity: formatCountQuantity(quantityValue), quantityValue, name: match[2] };
  }

  return { name: trimmed };
};
