import type { GroupedSectionView } from '../types';
import { Card } from '../components/Card';
import { RouteSectionCard } from '../components/RouteSectionCard';
import { useI18n } from '../lib/i18n';

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
  const { messages } = useI18n();
  return (
    <Card
      header={
        <div className="title-row">
          <div>
            <h2 className="title title-md">{messages.pages.route.title}</h2>
            <p className="subtitle">{messages.pages.route.subtitle}</p>
          </div>
          <div className="button-row">
            <input
              className="input input-wide"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={messages.pages.route.filterPlaceholder}
            />
            <button type="button" className="button" onClick={onResetChecks}>
              {messages.actions.resetTicks}
            </button>
            <button type="button" className="button button-primary" onClick={onResort}>
              {messages.actions.resortFromList}
            </button>
          </div>
        </div>
      }
    >
      <div className="scroll-region stack">
        {!hasItems ? (
          <div className="empty-state stack">
            <div>{messages.pages.route.emptyNoItems}</div>
            <div className="button-row warning-actions">
              <button type="button" className="button button-primary" onClick={onOpenEdit}>
                {messages.actions.goToEditList}
              </button>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className="empty-state">{messages.pages.route.emptyNoResults}</div>
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
