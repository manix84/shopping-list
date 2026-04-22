import type { GroupedSectionView } from '../types';
import { Card } from '../components/Card';
import { RouteSectionCard } from '../components/RouteSectionCard';

type RoutePageProps = {
  query: string;
  grouped: GroupedSectionView[];
  hasItems: boolean;
  onQueryChange: (value: string) => void;
  onResetChecks: () => void;
  onResort: () => void;
  onToggleSection: (sectionKey: GroupedSectionView['key'], checked: boolean) => void;
  onToggleItem: (itemId: string) => void;
  onOpenEdit: () => void;
};

export function RoutePage({
  grouped,
  query,
  hasItems,
  onQueryChange,
  onResetChecks,
  onResort,
  onToggleSection,
  onToggleItem,
  onOpenEdit,
}: RoutePageProps) {
  return (
    <Card
      header={
        <div className="title-row">
          <div>
            <h2 className="title title-md">Store route</h2>
            <p className="subtitle">Incomplete sections stay near the top. Fully completed sections drop to the bottom.</p>
          </div>
          <div className="button-row">
            <input
              className="input input-wide"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Filter items"
            />
            <button className="button" onClick={onResetChecks}>Reset ticks</button>
            <button className="button button-primary" onClick={onResort}>Re-sort from list</button>
          </div>
        </div>
      }
    >
      <div className="scroll-region stack">
        {!hasItems ? (
          <div className="empty-state stack">
            <div>
              You need to add items on the Edit list page before the store route can be shown.
            </div>
            <div className="button-row warning-actions">
              <button className="button button-primary" onClick={onOpenEdit}>Go to Edit list</button>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className="empty-state">Nothing to show yet. Head back to the edit page and add some items.</div>
        ) : (
          grouped.map((section) => (
            <RouteSectionCard
              key={section.key}
              section={section}
              onToggleSection={onToggleSection}
              onToggleItem={onToggleItem}
            />
          ))
        )}
      </div>
    </Card>
  );
}
