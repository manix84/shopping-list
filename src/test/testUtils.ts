type StorageSeed = Record<string, string>;

export type LocalStorageMock = ReturnType<typeof createLocalStorageMock>;

export const createLocalStorageMock = (seed: StorageSeed = {}) => {
  const store = new Map<string, string>(Object.entries(seed));

  return {
    getItem: (key: string) => (store.has(key) ? store.get(key) ?? null : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    dump: () => Object.fromEntries(store.entries()),
  };
};

export const createWindowMock = (
  options: { storageSeed?: StorageSeed; prefersDark?: boolean; language?: string } = {},
) => {
  const localStorage = createLocalStorageMock(options.storageSeed);
  const prefersDark = options.prefersDark ?? false;
  const language = options.language ?? 'en-GB';

  return {
    localStorage,
    navigator: {
      language,
    },
    matchMedia: (query: string) => ({
      matches: prefersDark && query.includes('prefers-color-scheme: dark'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  } as const;
};
