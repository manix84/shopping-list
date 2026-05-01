import type { CountryConfig } from '../types';
import { extractMeasurementQuantity } from './measurements';
import { cleanLine } from './stringUtils';

export const formatCountQuantity = (value: number): string => `x${value}`;

export const parseQuantityValue = (quantity: unknown): number | undefined => {
  const cleanedQuantity = cleanLine(quantity).toLowerCase().replace(/\s+/g, ' ');

  let match = cleanedQuantity.match(/^x\s*(\d+(?:\.\d+)?)$/i);
  if (match) return Number(match[1]);

  match = cleanedQuantity.match(/^(\d+(?:\.\d+)?)\s*x$/i);
  if (match) return Number(match[1]);

  match = cleanedQuantity.match(/^(\d+(?:\.\d+)?)$/i);
  if (match) return Number(match[1]);

  return undefined;
};

type ExtractedQuantifiedItem = {
  name: string;
  quantity?: string;
  quantityDisplay?: string;
  quantityMetricValue?: number;
  quantityMetricUnit?: 'g' | 'ml';
  quantityValue?: number;
};

const extractCountQuantity = (value: string): ExtractedQuantifiedItem => {
  let match = value.match(/^(\d+)\s*x\s+(.+)$/i);
  if (match) {
    const quantityValue = Number(match[1]);
    return { quantityValue, name: match[2] };
  }

  match = value.match(/^(x\s*\d+)\s+(.+)$/i);
  if (match) {
    return { quantityValue: parseQuantityValue(match[1]), name: match[2] };
  }

  match = value.match(/^(.+?)\s+x\s*(\d+)$/i);
  if (match) {
    const quantityValue = Number(match[2]);
    return { quantityValue, name: match[1] };
  }

  match = value.match(/^(\d+)\s+(.+)$/i);
  if (match) {
    const quantityValue = Number(match[1]);
    return { quantityValue, name: match[2] };
  }

  return { name: value };
};

const extractUnitQuantity = (value: string): { quantity?: string; name: string } => {
  let match = value.match(/^(\d+(?:\.\d+)?[a-zA-Z]+)\s+(.+)$/i);
  if (match) {
    return { quantity: match[1], name: match[2] };
  }

  match = value.match(/^(.+?)\s+(\d+(?:\.\d+)?[a-zA-Z]+)$/i);
  if (match) {
    return { quantity: match[2], name: match[1] };
  }

  return { name: value };
};

export const extractQuantifiedItem = (value: unknown, config?: CountryConfig): ExtractedQuantifiedItem => {
  const trimmed = cleanLine(value);
  const measured = extractMeasurementQuantity(trimmed, config);
  if (measured) return measured;

  const counted = extractCountQuantity(trimmed);
  const unitized = extractUnitQuantity(counted.name);

  return {
    name: unitized.name,
    quantity: unitized.quantity,
    quantityValue: counted.quantityValue,
  };
};

export const extractQuantity = (value: unknown): { quantity?: string; quantityValue?: number; name: string } => {
  const extracted = extractQuantifiedItem(value);

  if (typeof extracted.quantityValue === 'number') {
    return { quantity: formatCountQuantity(extracted.quantityValue), quantityValue: extracted.quantityValue, name: extracted.name };
  }

  return { quantity: extracted.quantity, name: extracted.name };
};
