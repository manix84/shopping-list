import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWindowMock } from '../test/testUtils';
import {
  browserNotificationPermission,
  loadNotificationsEnabled,
  NOTIFICATIONS_STORAGE_KEY,
  saveNotificationsEnabled,
} from './notificationPreference';

describe('notification preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults notifications to disabled', () => {
    vi.stubGlobal('window', createWindowMock());

    expect(loadNotificationsEnabled()).toBe(false);
  });

  it('saves and loads the enabled preference', () => {
    const windowMock = createWindowMock();
    vi.stubGlobal('window', windowMock);

    saveNotificationsEnabled(true);

    expect(windowMock.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)).toBe('true');
    expect(loadNotificationsEnabled()).toBe(true);
  });

  it('treats false and other stored values as disabled', () => {
    const windowMock = createWindowMock({
      storageSeed: { [NOTIFICATIONS_STORAGE_KEY]: 'false' },
    });
    vi.stubGlobal('window', windowMock);

    expect(loadNotificationsEnabled()).toBe(false);

    windowMock.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, 'yes');

    expect(loadNotificationsEnabled()).toBe(false);
  });

  it('reports unsupported notifications when the browser API is unavailable', () => {
    vi.stubGlobal('window', createWindowMock());

    expect(browserNotificationPermission()).toBe('unsupported');
  });

  it('reports the browser notification permission when supported', () => {
    const windowMock = createWindowMock() as unknown as Window & typeof globalThis & {
      Notification: { permission: NotificationPermission };
    };
    windowMock.Notification = { permission: 'granted' } as unknown as typeof Notification;
    vi.stubGlobal('window', windowMock);
    vi.stubGlobal('Notification', windowMock.Notification);

    expect(browserNotificationPermission()).toBe('granted');
  });
});
