export const NOTIFICATIONS_STORAGE_KEY = 'smart-shopping-list-notifications-v1';

export const loadNotificationsEnabled = (): boolean => {
  if (typeof window === 'undefined') { return false; }
  return window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) === 'true';
};

export const saveNotificationsEnabled = (enabled: boolean): void => {
  if (typeof window === 'undefined') { return; }
  window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(enabled));
};

export const browserNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) { return 'unsupported'; }
  return Notification.permission;
};
