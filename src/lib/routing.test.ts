import { describe, expect, it } from 'vitest';
import { readRouteFromLocationParts, routeToUrl } from './routing';

const LIST_ID = '019dbf30-56de-7b2b-aacc-a5ae59430d7f';

describe('routing', () => {
  it('reads path-based shared list routes', () => {
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/route` })).toEqual({
      page: 'route',
      listId: LIST_ID,
    });
  });

  it('reads bare shared list routes', () => {
    expect(readRouteFromLocationParts({ pathname: `/${LIST_ID}` })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}` })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
  });

  it('reads shared list routes under a configured base path', () => {
    expect(readRouteFromLocationParts({ pathname: `/shopping-list/list/${LIST_ID}/debug`, basePath: '/shopping-list/' })).toEqual({
      page: 'debug',
      listId: LIST_ID,
    });
  });

  it('reads debug tab routes', () => {
    expect(readRouteFromLocationParts({ pathname: '/debug/settings' })).toEqual({
      page: 'debug',
      debugTab: 'settings',
    });
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/debug/backend` })).toEqual({
      page: 'debug',
      listId: LIST_ID,
      debugTab: 'backend',
    });
  });

  it('keeps compatibility with short shared-list URLs', () => {
    expect(readRouteFromLocationParts({ pathname: `/${LIST_ID}/unknown` })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
  });

  it('uses the not-found page for unknown canonical shared-list pages', () => {
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/unknown` })).toEqual({
      page: 'not-found',
      listId: LIST_ID,
    });
  });

  it('reads error pages', () => {
    expect(readRouteFromLocationParts({ pathname: '/404' })).toEqual({ page: 'not-found' });
    expect(readRouteFromLocationParts({ pathname: '/500' })).toEqual({ page: 'server-error' });
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/404` })).toEqual({
      page: 'not-found',
      listId: LIST_ID,
    });
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/500` })).toEqual({
      page: 'server-error',
      listId: LIST_ID,
    });
  });

  it('keeps the root route on edit and sends unknown paths to not found', () => {
    expect(readRouteFromLocationParts({ pathname: '/' })).toEqual({ page: 'edit' });
    expect(readRouteFromLocationParts({ pathname: '/unknown' })).toEqual({ page: 'not-found' });
  });

  it('reads regular path routes', () => {
    expect(readRouteFromLocationParts({ pathname: '/settings' })).toEqual({ page: 'settings' });
  });

  it('keeps settings, sections, and about app-level when rendering URLs', () => {
    expect(routeToUrl({ page: 'settings', listId: LIST_ID })).toBe('/settings');
    expect(routeToUrl({ page: 'sections', listId: LIST_ID })).toBe('/sections');
    expect(routeToUrl({ page: 'about', listId: LIST_ID })).toBe('/about');
  });

  it('renders list-specific edit and route URLs', () => {
    expect(routeToUrl({ page: 'edit', listId: LIST_ID })).toBe(`/list/${LIST_ID}/edit`);
    expect(routeToUrl({ page: 'route', listId: LIST_ID })).toBe(`/list/${LIST_ID}/route`);
  });

  it('renders debug tab URLs', () => {
    expect(routeToUrl({ page: 'debug', debugTab: 'settings' })).toBe('/debug/settings');
    expect(routeToUrl({ page: 'debug', listId: LIST_ID, debugTab: 'backend' })).toBe(
      `/list/${LIST_ID}/debug/backend`,
    );
  });

  it('uses path routes when there is no visible shared list id', () => {
    expect(routeToUrl({ page: 'edit' })).toBe('/edit');
  });

  it('renders error page URLs', () => {
    expect(routeToUrl({ page: 'not-found' })).toBe('/404');
    expect(routeToUrl({ page: 'server-error' })).toBe('/500');
    expect(routeToUrl({ page: 'not-found', listId: LIST_ID })).toBe(`/list/${LIST_ID}/404`);
    expect(routeToUrl({ page: 'server-error', listId: LIST_ID })).toBe(`/list/${LIST_ID}/500`);
  });

  it('renders URLs under a configured base path', () => {
    expect(routeToUrl({ page: 'route', listId: LIST_ID }, '/shopping-list/')).toBe(
      `/shopping-list/list/${LIST_ID}/route`,
    );
    expect(routeToUrl({ page: 'settings' }, '/shopping-list/')).toBe('/shopping-list/settings');
  });
});
