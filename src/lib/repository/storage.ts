import type { ShoppingListRecord } from '../../types';

export type MaybePromise<T> = T | Promise<T>;

export type ShoppingListRepository = {
  load: () => MaybePromise<ShoppingListRecord>;
  save: (record: ShoppingListRecord) => MaybePromise<void>;
  clear: () => MaybePromise<void>;
};
