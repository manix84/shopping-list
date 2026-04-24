import { mdiViewAgendaOutline, mdiViewDayOutline, mdiViewListOutline } from '@mdi/js';
import type { GroupedSectionView } from '../types';
import { Card } from '../components/Card';
import { RouteSectionCard } from '../components/RouteSectionCard';
import { getRouteViewLabel, useI18n } from '../lib/i18n';
import type { RouteViewMode } from '../types';

type RoutePageProps = {
  query: string;
  grouped: GroupedSectionView[];
  hasItems: boolean;
  viewMode: RouteViewMode;
  onQueryChange: (value: string) => void;
  onViewModeChange: (mode: RouteViewMode) => void;
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
  viewMode,
  onQueryChange,
  onViewModeChange,
  onResetChecks,
  onResort,
  onToggleSection,
  onToggleItem,
  onOpenEdit,
}: RoutePageProps) {
  const { messages } = useI18n();
  const viewOptions: Array<{ mode: RouteViewMode; icon: string }> = [
    { mode: 'default', icon: mdiViewAgendaOutline },
    { mode: 'comfortable', icon: mdiViewDayOutline },
    { mode: 'compact', icon: mdiViewListOutline },
  ];

  return (
    <Card
      bodyClassName={`route-page route-page-${viewMode}`}
      header={
        <div className="title-row">
          <div>
            <h2 className="title title-md">{messages.pages.route.title}</h2>
            <p className="subtitle">{messages.pages.route.subtitle}</p>
          </div>
          <div className="button-row">
            <div className="route-view-controls" role="group" aria-label={messages.pages.route.title}>
              {viewOptions.map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  className={`button button-icon ${viewMode === option.mode ? 'button-active' : ''}`}
                  onClick={() => onViewModeChange(option.mode)}
                  aria-label={getRouteViewLabel(option.mode, messages)}
                  title={getRouteViewLabel(option.mode, messages)}
                >
                  <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                    <path d={option.icon} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
            <input
              className="input input-wide"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={messages.pages.route.filterPlaceholder}
            />
            <button type="button" className="button" onClick={onResetChecks}>
              {messages.actions.resetTicks}
            </button>
            {hasItems ? (
              <button type="button" className="button" onClick={onOpenEdit}>
                {messages.actions.editList}
              </button>
            ) : null}
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
              viewMode={viewMode}
              onToggleSection={onToggleSection}
              onToggleItem={onToggleItem}
            />
          ))
        )}
      </div>
    </Card>
  );
}
