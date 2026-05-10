export const readLocalStorageValue = (
  storageKey: string,
  legacyStorageKeys: readonly string[] = [],
): string | null => {
  const removeLegacyStorageKeys = (): void => {
    for (const legacyStorageKey of legacyStorageKeys) {
      try {
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        // Non-fatal: storage cleanup should not block reading the value.
      }
    }
  };

  const currentValue = window.localStorage.getItem(storageKey);
  if (currentValue !== null) {
    removeLegacyStorageKeys();
    return currentValue;
  }

  for (const legacyStorageKey of legacyStorageKeys) {
    const legacyValue = window.localStorage.getItem(legacyStorageKey);
    if (legacyValue !== null) {
      try {
        window.localStorage.setItem(storageKey, legacyValue);
        removeLegacyStorageKeys();
      } catch {
        // Keep returning the legacy value even if migration is blocked.
      }
      return legacyValue;
    }
  }

  return null;
};

export const hasLocalStorageValue = (
  storageKey: string,
  legacyStorageKeys: readonly string[] = [],
): boolean => readLocalStorageValue(storageKey, legacyStorageKeys) !== null;
