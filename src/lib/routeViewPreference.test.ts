import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  ROUTE_VIEW_STORAGE_KEY,
  defaultRouteViewMode,
  loadRouteViewMode,
  saveRouteViewMode,
} from './routeViewPreference';

describe('route view preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to default view mode', () => {
    expect(defaultRouteViewMode()).toBe('default');
    expect(loadRouteViewMode()).toBe('default');
  });

  it.each(['default', 'comfortable', 'compact'] as const)('loads saved %s mode', (mode) => {
    const windowMock = createWindowMock({ storageSeed: { [ROUTE_VIEW_STORAGE_KEY]: mode } });
    vi.stubGlobal('window', windowMock);

    expect(loadRouteViewMode()).toBe(mode);
  });

  it('falls back when the saved route view mode is invalid', () => {
    vi.stubGlobal('window', createWindowMock({ storageSeed: { [ROUTE_VIEW_STORAGE_KEY]: 'wide' } }));

    expect(loadRouteViewMode()).toBe('default');
  });

  it('saves route view mode locally', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    saveRouteViewMode('compact');

    expect(windowMock.localStorage.getItem(ROUTE_VIEW_STORAGE_KEY)).toBe('compact');
  });
});
