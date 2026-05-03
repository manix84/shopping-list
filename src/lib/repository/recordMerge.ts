import type { ShoppingListRecord } from '../../types';

const timestampValue = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const chooseNewestRecord = ({
  local,
  remote,
  hasLocalRecord,
  hasRemoteRecord,
}: {
  local: ShoppingListRecord;
  remote: ShoppingListRecord;
  hasLocalRecord: boolean;
  hasRemoteRecord: boolean;
}): ShoppingListRecord => {
  if (hasLocalRecord && !hasRemoteRecord) { return local; }
  if (!hasLocalRecord && hasRemoteRecord) { return remote; }
  if (!hasLocalRecord && !hasRemoteRecord) { return remote; }

  return timestampValue(local.updatedAt) >= timestampValue(remote.updatedAt) ? local : remote;
};
