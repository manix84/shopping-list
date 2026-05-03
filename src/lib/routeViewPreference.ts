import type { RouteViewMode } from '../types';

export const ROUTE_VIEW_STORAGE_KEY = 'smart-shopping-list-route-view-v1';

export const defaultRouteViewMode = (): RouteViewMode => 'default';

export const loadRouteViewMode = (): RouteViewMode => {
  if (typeof window === 'undefined') { return defaultRouteViewMode(); }

  const raw = window.localStorage.getItem(ROUTE_VIEW_STORAGE_KEY);
  return raw === 'default' || raw === 'comfortable' || raw === 'compact' ? raw : defaultRouteViewMode();
};

export const saveRouteViewMode = (mode: RouteViewMode): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(ROUTE_VIEW_STORAGE_KEY, mode);
};
