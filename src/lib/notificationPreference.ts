import { readLocalStorageValue } from './storageKeys';

export const NOTIFICATIONS_STORAGE_KEY = 'shoppingList:notifications';
const LEGACY_NOTIFICATIONS_STORAGE_KEYS = ['smart-shopping-list-notifications-v1'] as const;

export const loadNotificationsEnabled = (): boolean => {
  if (typeof window === 'undefined') { return false; }
  return readLocalStorageValue(NOTIFICATIONS_STORAGE_KEY, LEGACY_NOTIFICATIONS_STORAGE_KEYS) === 'true';
};

export const saveNotificationsEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(enabled));
};

export const browserNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) { return 'unsupported'; }
  return Notification.permission;
};
