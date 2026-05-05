import type { AppRoute, PageKey } from '../types';
import { isUuidV7 } from './uuid';

const APP_LEVEL_PAGES: PageKey[] = ['sections', 'settings', 'about', 'not-found', 'server-error'];
const PATH_PAGE_MAP: Record<string, PageKey> = {
  '404': 'not-found',
  '500': 'server-error',
  'not-found': 'not-found',
  'server-error': 'server-error',
  about: 'about',
  debug: 'debug',
  edit: 'edit',
  route: 'route',
  sections: 'sections',
  settings: 'settings',
};
const DEFAULT_PAGE: PageKey = 'edit';

const normalizeBasePath = (basePath: string): string => (basePath === '/' ? '' : basePath.replace(/\/$/, ''));

export const readRouteFromLocationParts = ({
  pathname,
  basePath = '',
}: {
  pathname: string;
  basePath?: string;
}): AppRoute => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const pathParts = pathname
    .slice(normalizedBasePath.length)
    .toLowerCase()
    .split('/')
    .filter(Boolean);

  if (pathParts.length === 0) {
    return { page: DEFAULT_PAGE };
  }

  if (pathParts[0] === 'list' && isUuidV7(pathParts[1])) {
    const page = pathParts[2] ? PATH_PAGE_MAP[pathParts[2]] ?? 'not-found' : DEFAULT_PAGE;
    return { page, listId: pathParts[1] };
  }

  if (isUuidV7(pathParts[0])) {
    const page = PATH_PAGE_MAP[pathParts[1] ?? ''] ?? DEFAULT_PAGE;
    return { page, listId: pathParts[0] };
  }

  const page = PATH_PAGE_MAP[pathParts[0]] ?? 'not-found';
  return { page };
};

export const routeToUrl = ({ page, listId }: AppRoute, basePath = ''): string => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const pathPage = page === 'not-found' ? '404' : page === 'server-error' ? '500' : page;
  const shouldShowListId = !APP_LEVEL_PAGES.includes(page) && Boolean(listId);
  return shouldShowListId ? `${normalizedBasePath}/list/${listId}/${pathPage}` : `${normalizedBasePath}/${pathPage}`;
};
