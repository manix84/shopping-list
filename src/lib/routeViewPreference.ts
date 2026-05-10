import type { RouteViewMode } from '../types';
import { readLocalStorageValue } from './storageKeys';

export const ROUTE_VIEW_STORAGE_KEY = 'shoppingList:routeView';
const LEGACY_ROUTE_VIEW_STORAGE_KEYS = ['smart-shopping-list-route-view-v1'] as const;

export const defaultRouteViewMode = (): RouteViewMode => 'default';

export const loadRouteViewMode = (): RouteViewMode => {
  if (typeof window === 'undefined') { return defaultRouteViewMode(); }

  const raw = readLocalStorageValue(ROUTE_VIEW_STORAGE_KEY, LEGACY_ROUTE_VIEW_STORAGE_KEYS);
  return raw === 'default' || raw === 'comfortable' || raw === 'compact' ? raw : defaultRouteViewMode();
};

export const saveRouteViewMode = (mode: RouteViewMode): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(ROUTE_VIEW_STORAGE_KEY, mode);
};
