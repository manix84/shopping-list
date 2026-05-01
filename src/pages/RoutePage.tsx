import { mdiBeakerOutline, mdiCupOutline, mdiMagnify, mdiViewAgendaOutline, mdiViewDayOutline, mdiViewListOutline } from '@mdi/js';
import type { GroupedSectionView } from '../types';
import { Card } from '../components/Card';
import { RouteSectionCard } from '../components/RouteSectionCard';
import { getRouteViewLabel, useI18n } from '../lib/i18n';
import type { RouteViewMode } from '../types';

type RoutePageProps = {
  query: string;
  isFilterVisible: boolean;
  grouped: GroupedSectionView[];
  hasItems: boolean;
  viewMode: RouteViewMode;
  ingredientMode: boolean;
  canUseIngredientMode: boolean;
  onQueryChange: (value: string) => void;
  onToggleFilter: () => void;
  onViewModeChange: (mode: RouteViewMode) => void;
  onIngredientModeChange: (enabled: boolean) => void;
  onToggleSection: (sectionKey: GroupedSectionView['key'], checked: boolean) => void;
  onToggleItem: (itemId: string) => void;
  onOpenEdit: () => void;
};

export function RoutePage({
  grouped,
  query,
  isFilterVisible,
  hasItems,
  viewMode,
  ingredientMode,
  canUseIngredientMode,
  onQueryChange,
  onToggleFilter,
  onViewModeChange,
  onIngredientModeChange,
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
  const ingredientModeLabel = ingredientMode
    ? messages.labels.ingredientModeSwitchToMetric
    : messages.labels.ingredientModeSwitchToCups;

  return (
    <Card
      bodyClassName={`route-page route-page-${viewMode}`}
      header={
        <div className="title-row route-page-header">
          <div className="route-page-header-copy">
            <h2 className="title title-md">{messages.pages.route.title}</h2>
            <p className="subtitle">{messages.pages.route.subtitle}</p>
          </div>
          <div className="route-toolbar">
            <div className="route-toolbar-row">
              <div className="route-view-controls" role="group" aria-label={messages.pages.route.title}>
                {viewOptions.map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    className={`button button-icon ${viewMode === option.mode ? 'button-active' : ''}`}
                    onClick={() => onViewModeChange(option.mode)}
                    aria-label={getRouteViewLabel(option.mode, messages)}
                    aria-pressed={viewMode === option.mode}
                    title={getRouteViewLabel(option.mode, messages)}
                  >
                    <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                      <path d={option.icon} fill="currentColor" />
                    </svg>
                  </button>
                ))}
              </div>
              {canUseIngredientMode ? (
                <>
                  <div className="route-tools-divider" aria-hidden="true" />
                  <button
                    type="button"
                    className={`button button-icon ingredient-mode-toggle ${ingredientMode ? 'button-active' : ''}`}
                    onClick={() => onIngredientModeChange(!ingredientMode)}
                    aria-label={ingredientModeLabel}
                    aria-pressed={ingredientMode}
                    title={ingredientModeLabel}
                  >
                    <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                      <path d={ingredientMode ? mdiBeakerOutline : mdiCupOutline} fill="currentColor" />
                    </svg>
                  </button>
                </>
              ) : null}
              <div className="route-tools-divider" aria-hidden="true" />
              <button
                type="button"
                className={`button button-icon ${isFilterVisible ? 'button-active' : ''}`}
                onClick={onToggleFilter}
                aria-label={messages.actions.filterItems}
                aria-pressed={isFilterVisible}
                aria-expanded={isFilterVisible}
                aria-controls={isFilterVisible ? 'route-filter-input' : undefined}
                title={messages.actions.filterItems}
              >
                <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                  <path d={mdiMagnify} fill="currentColor" />
                </svg>
              </button>
            </div>
            {isFilterVisible ? (
              <input
                id="route-filter-input"
                className="input route-filter-input"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                aria-label={messages.actions.filterItems}
                placeholder={messages.pages.route.filterPlaceholder}
              />
            ) : null}
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
