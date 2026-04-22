import type { ShoppingListRecord } from '../../types';

export type ShoppingListRepository = {
  load: () => ShoppingListRecord;
  save: (record: ShoppingListRecord) => void;
  clear: () => void;
};
