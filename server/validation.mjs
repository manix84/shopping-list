import { COUNTRY_CODES, SECTION_KEYS } from './constants.mjs';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const isIsoTimestamp = (value) => {
  if (typeof value !== 'string' || !ISO_TIMESTAMP_PATTERN.test(value)) return false;

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
};

const isShoppingListItem = (value) =>
  value &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.raw === 'string' &&
  typeof value.normalized === 'string' &&
  typeof value.cleaned === 'string' &&
  typeof value.checked === 'boolean' &&
  SECTION_KEYS.has(value.matchedSection);

export const isShoppingListRecord = (value, sharedListId) =>
  value &&
  typeof value === 'object' &&
  (value.listId === undefined || UUID_V7_PATTERN.test(value.listId)) &&
  (sharedListId === undefined || value.listId === undefined || value.listId === sharedListId) &&
  typeof value.input === 'string' &&
  Array.isArray(value.items) &&
  value.items.every(isShoppingListItem) &&
  isIsoTimestamp(value.updatedAt) &&
  COUNTRY_CODES.has(value.countryCode);

export const isSettingsRecord = (value) =>
  value &&
  typeof value === 'object' &&
  COUNTRY_CODES.has(value.countryCode) &&
  isIsoTimestamp(value.updatedAt);
