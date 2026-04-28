import type { ReactNode } from 'react';
import type { BackendStatus, GroupedSectionView, Item } from '../types';

export const noop = () => undefined;

export const sampleItems: Item[] = [
  {
    id: 'item-1',
    raw: 'large oat milk x2',
    normalized: 'large oat milk x2',
    cleaned: 'oat milk',
    size: 'large',
    sizeValue: 'L',
    quantity: 'x2',
    quantityValue: 2,
    variant: 'oat',
    checked: false,
    matchedSection: 'chilled_milk_juice_cream',
  },
  {
    id: 'item-2',
    raw: 'bananas',
    normalized: 'bananas',
    cleaned: 'bananas',
    checked: true,
    matchedSection: 'produce',
  },
  {
    id: 'item-3',
    raw: '500g pasta',
    normalized: '500g pasta',
    cleaned: 'pasta',
    quantity: '500g',
    checked: false,
    matchedSection: 'pasta',
  },
];

export const sampleSection: GroupedSectionView = {
  key: 'chilled_milk_juice_cream',
  label: 'Milk / Juice / Cream',
  groupLabel: 'Chillers',
  order: 3,
  checkedCount: 1,
  complete: false,
  items: sampleItems.filter((item) => item.matchedSection === 'chilled_milk_juice_cream').concat(sampleItems[1]),
};

export const connectedBackend: BackendStatus = {
  state: 'connected',
  health: { ok: true },
  database: { ok: true, settingsExists: true, settingsCountryCode: 'uk' },
};

export const offlineBackend: BackendStatus = {
  state: 'offline',
  health: { ok: false },
  database: { ok: false },
};

export function StoryCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="shopping-app">
      <div className="shopping-shell" style={{ paddingBlock: 24 }}>
        {children}
      </div>
    </main>
  );
}
