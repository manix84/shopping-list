import type { AppRoute, DebugTabKey, PageKey } from '../types';
import { isUuidV7 } from './uuid';

const APP_LEVEL_PAGES: PageKey[] = ['sections', 'settings', 'about', 'debug'];
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
const DEBUG_TAB_KEYS: DebugTabKey[] = [
  'parsed',
  'state',
  'backend',
  'config',
  'matcher',
  'quantity',
  'measurements',
  'weights',
  'variants',
  'layout',
  'sections',
  'storage',
  'host',
  'events',
  'settings',
];

const normalizeBasePath = (basePath: string): string => (basePath === '/' ? '' : basePath.replace(/\/$/, ''));
const isDebugTabKey = (value: string | undefined): value is DebugTabKey =>
  DEBUG_TAB_KEYS.includes(value as DebugTabKey);
const debugTabFromPath = (page: PageKey, tab: string | undefined): DebugTabKey | undefined =>
  page === 'debug' && isDebugTabKey(tab) ? tab : undefined;

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
    const debugTab = debugTabFromPath(page, pathParts[3]);
    return debugTab ? { page, listId: pathParts[1], debugTab } : { page, listId: pathParts[1] };
  }

  if (isUuidV7(pathParts[0])) {
    const page = PATH_PAGE_MAP[pathParts[1] ?? ''] ?? DEFAULT_PAGE;
    return { page, listId: pathParts[0] };
  }

  const page = PATH_PAGE_MAP[pathParts[0]] ?? 'not-found';
  const debugTab = debugTabFromPath(page, pathParts[1]);
  return debugTab ? { page, debugTab } : { page };
};

export const routeToUrl = ({ page, listId, debugTab }: AppRoute, basePath = ''): string => {
  const normalizedBasePath = normalizeBasePath(basePath);
  const pathPage = page === 'not-found' ? '404' : page === 'server-error' ? '500' : page;
  const shouldShowListId = !APP_LEVEL_PAGES.includes(page) && Boolean(listId);
  const tabPath = page === 'debug' && debugTab ? `/${debugTab}` : '';
  return shouldShowListId
    ? `${normalizedBasePath}/list/${listId}/${pathPage}${tabPath}`
    : `${normalizedBasePath}/${pathPage}${tabPath}`;
};
