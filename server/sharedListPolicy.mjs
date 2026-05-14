export const isEmptyShoppingListRecord = (record) =>
  record &&
  typeof record === 'object' &&
  typeof record.input === 'string' &&
  record.input.trim() === '' &&
  Array.isArray(record.items) &&
  record.items.length === 0;

export const canPersistSharedListRecord = (record, activeClientCount = 0) =>
  !isEmptyShoppingListRecord(record) || activeClientCount > 1;
