import { cleanLine, normalize } from './stringUtils';

export type SizeValue = 'S' | 'M' | 'L';

export const parseSizeValue = (size: unknown): SizeValue | undefined => {
  const cleanedSize = normalize(size);
  if (cleanedSize === 'small' || cleanedSize === 's') return 'S';
  if (cleanedSize === 'medium' || cleanedSize === 'm') return 'M';
  if (cleanedSize === 'large' || cleanedSize === 'l') return 'L';
  return undefined;
};

export const formatSizeLabel = (sizeValue: SizeValue): string => `Size: ${sizeValue}`;

export const extractSize = (value: unknown): { size?: string; sizeValue?: SizeValue; name: string } => {
  const trimmed = cleanLine(value);

  const match = trimmed.match(/^(small|medium|large)\s+(.+)$/i);
  if (!match) {
    return { name: trimmed };
  }

  const sizeValue = parseSizeValue(match[1]);
  return { size: match[1].toLowerCase(), sizeValue, name: match[2] };
};
