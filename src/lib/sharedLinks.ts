import { isUuidV7 } from './uuid';

const normalizeBasePath = (basePath: string): string => (basePath === '/' ? '' : basePath.replace(/\/$/, ''));
const normalizeOrigin = (origin: string): string => origin.replace(/\/$/, '').toLowerCase();

const extractListIdFromParts = (parts: string[]): string | undefined => {
  if (parts[0] === 'list' && isUuidV7(parts[1])) {
    return parts[1].toLowerCase();
  }

  if (isUuidV7(parts[0])) {
    return parts[0].toLowerCase();
  }

  return undefined;
};

export const extractSharedListId = (value: string, basePath = '', origin?: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) { return undefined; }
  if (isUuidV7(trimmed)) { return trimmed.toLowerCase(); }

  try {
    const url = new URL(trimmed);
    const normalizedBasePath = normalizeBasePath(basePath);
    if (origin && normalizeOrigin(url.origin) !== normalizeOrigin(origin)) {
      return undefined;
    }
    if (
      normalizedBasePath &&
      url.pathname !== normalizedBasePath &&
      !url.pathname.startsWith(`${normalizedBasePath}/`)
    ) {
      return undefined;
    }
    const pathParts = url.pathname
      .slice(normalizedBasePath.length)
      .toLowerCase()
      .split('/')
      .filter(Boolean);
    const pathListId = extractListIdFromParts(pathParts);
    if (pathListId) { return pathListId; }

    return undefined;
  } catch {
    return undefined;
  }
};
