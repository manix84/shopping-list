export const readLocalStorageValue = (
  storageKey: string,
  legacyStorageKeys: readonly string[] = [],
): string | null => {
  if (typeof window === 'undefined') { return null; }

  const removeLegacyStorageKeys = (): void => {
    for (const legacyStorageKey of legacyStorageKeys) {
      try {
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        // Non-fatal: storage cleanup should not block reading the value.
      }
    }
  };

  const readStorageKey = (key: string): string | null | undefined => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return undefined;
    }
  };

  const currentValue = readStorageKey(storageKey);
  if (currentValue === undefined) {
    return null;
  }

  if (currentValue !== null) {
    removeLegacyStorageKeys();
    return currentValue;
  }

  for (const legacyStorageKey of legacyStorageKeys) {
    const legacyValue = readStorageKey(legacyStorageKey);
    if (legacyValue === undefined) {
      return null;
    }

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
