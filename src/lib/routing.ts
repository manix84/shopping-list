import type { AppRoute, PageKey } from '../types';
import { isUuidV7 } from './uuid';

const APP_PAGES: PageKey[] = ['edit', 'route', 'settings', 'debug'];
const DEFAULT_PAGE: PageKey = 'edit';

const normalizeBasePath = (basePath: string): string => (basePath === '/' ? '' : basePath.replace(/\/$/, ''));

export const readRouteFromLocationParts = ({
  pathname,
  hash,
  basePath = '',
}: {
  pathname: string;
  hash: string;
  basePath?: string;
}): AppRoute => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const pathParts = pathname
    .slice(normalizedBasePath.length)
    .toLowerCase()
    .split('/')
    .filter(Boolean);

  if (pathParts[0] === 'list' && isUuidV7(pathParts[1])) {
    const page = APP_PAGES.includes(pathParts[2] as PageKey) ? (pathParts[2] as PageKey) : DEFAULT_PAGE;
    return { page, listId: pathParts[1] };
  }

  const hashParts = hash.replace(/^#\/?/, '').toLowerCase().split('/').filter(Boolean);
  if (hashParts[0] === 'list' && isUuidV7(hashParts[1])) {
    const page = APP_PAGES.includes(hashParts[2] as PageKey) ? (hashParts[2] as PageKey) : DEFAULT_PAGE;
    return { page, listId: hashParts[1] };
  }

  const page = APP_PAGES.includes(hashParts[0] as PageKey) ? (hashParts[0] as PageKey) : DEFAULT_PAGE;
  return { page };
};

export const routeToUrl = ({ page, listId }: AppRoute, basePath = ''): string => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const shouldShowListId = page !== 'settings' && Boolean(listId);
  return shouldShowListId ? `${normalizedBasePath}/list/${listId}/${page}` : `${normalizedBasePath}/#/${page}`;
};
