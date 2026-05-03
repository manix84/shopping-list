import type { AppRoute, PageKey } from '../types';
import { isUuidV7 } from './uuid';

const APP_PAGES: PageKey[] = ['edit', 'route', 'sections', 'settings', 'about', 'debug'];
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

  if (pathParts[0] === 'list' && isUuidV7(pathParts[1])) {
    const page = APP_PAGES.includes(pathParts[2] as PageKey) ? (pathParts[2] as PageKey) : DEFAULT_PAGE;
    return { page, listId: pathParts[1] };
  }

  if (isUuidV7(pathParts[0])) {
    const page = APP_PAGES.includes(pathParts[1] as PageKey) ? (pathParts[1] as PageKey) : DEFAULT_PAGE;
    return { page, listId: pathParts[0] };
  }

  const page = APP_PAGES.includes(pathParts[0] as PageKey) ? (pathParts[0] as PageKey) : DEFAULT_PAGE;
  return { page };
};

export const routeToUrl = ({ page, listId }: AppRoute, basePath = ''): string => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const shouldShowListId = !['sections', 'settings', 'about'].includes(page) && Boolean(listId);
  return shouldShowListId ? `${normalizedBasePath}/list/${listId}/${page}` : `${normalizedBasePath}/${page}`;
};
