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
  });

  it('reads shared list routes under a configured base path', () => {
    expect(readRouteFromLocationParts({ pathname: `/shopping-list/list/${LIST_ID}/debug`, basePath: '/shopping-list/' })).toEqual({
      page: 'debug',
      listId: LIST_ID,
    });
  });

  it('falls back to edit for unknown shared-list pages', () => {
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/unknown` })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
    expect(readRouteFromLocationParts({ pathname: `/${LIST_ID}/unknown` })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
  });

  it('reads regular path routes and defaults unknown paths to edit', () => {
    expect(readRouteFromLocationParts({ pathname: '/settings' })).toEqual({ page: 'settings' });
    expect(readRouteFromLocationParts({ pathname: '/unknown' })).toEqual({ page: 'edit' });
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

  it('uses path routes when there is no visible shared list id', () => {
    expect(routeToUrl({ page: 'edit' })).toBe('/edit');
  });

  it('renders URLs under a configured base path', () => {
    expect(routeToUrl({ page: 'route', listId: LIST_ID }, '/shopping-list/')).toBe(
      `/shopping-list/list/${LIST_ID}/route`,
    );
    expect(routeToUrl({ page: 'settings' }, '/shopping-list/')).toBe('/shopping-list/settings');
  });
});
