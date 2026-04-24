import { describe, expect, it } from 'vitest';
import { readRouteFromLocationParts, routeToUrl } from './routing';

const LIST_ID = '019dbf30-56de-7b2b-aacc-a5ae59430d7f';

describe('routing', () => {
  it('reads path-based shared list routes', () => {
    expect(readRouteFromLocationParts({ pathname: `/list/${LIST_ID}/route`, hash: '' })).toEqual({
      page: 'route',
      listId: LIST_ID,
    });
  });

  it('reads bare shared list routes', () => {
    expect(readRouteFromLocationParts({ pathname: `/${LIST_ID}`, hash: '' })).toEqual({
      page: 'edit',
      listId: LIST_ID,
    });
  });

  it('keeps settings and sections app-level when rendering URLs', () => {
    expect(routeToUrl({ page: 'settings', listId: LIST_ID })).toBe('/#/settings');
    expect(routeToUrl({ page: 'sections', listId: LIST_ID })).toBe('/#/sections');
  });

  it('renders list-specific edit and route URLs', () => {
    expect(routeToUrl({ page: 'edit', listId: LIST_ID })).toBe(`/list/${LIST_ID}/edit`);
    expect(routeToUrl({ page: 'route', listId: LIST_ID })).toBe(`/list/${LIST_ID}/route`);
  });

  it('uses hash routes when there is no visible shared list id', () => {
    expect(routeToUrl({ page: 'edit' })).toBe('/#/edit');
  });
});
