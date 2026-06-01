import {
  mdiCupOutline,
  mdiMagnify,
  mdiRuler,
  mdiViewAgendaOutline,
  mdiViewDayOutline,
  mdiViewListOutline,
  mdiWeightPound,
} from '@mdi/js';
import { useEffect, useState } from 'react';
import type { GroupedSectionView, MeasurementDisplayMode } from '../types';
import { Card } from '../components/Card';
import { RouteSectionCard } from '../components/RouteSectionCard';
import { SaveStatusIndicator } from '../components/SaveStatusIndicator';
import { classNames } from '../lib/classNames';
import { getRouteViewLabel, useI18n } from '../lib/i18n';
import type { RouteViewMode, SaveStatus } from '../types';
import { p } from '../styles/primitives';
import sharedSt from '../components/SharedListPanel.module.scss';

type RoutePageProps = {
  listName: string;
  query: string;
  isFilterVisible: boolean;
  saveStatus: SaveStatus;
  grouped: GroupedSectionView[];
  hasItems: boolean;
  viewMode: RouteViewMode;
  measurementDisplayMode: MeasurementDisplayMode;
  onQueryChange: (value: string) => void;
  onToggleFilter: () => void;
  onViewModeChange: (mode: RouteViewMode) => void;
  onMeasurementDisplayModeChange: (mode: MeasurementDisplayMode) => void;
  onToggleSection: (sectionKey: GroupedSectionView['key'], checked: boolean) => void;
  onToggleItem: (itemId: string) => void;
  onResetChecks: () => void;
  onOpenEdit: () => void;
};

export function RoutePage({
  listName,
  grouped,
  query,
  isFilterVisible,
  saveStatus,
  hasItems,
  viewMode,
  measurementDisplayMode,
  onQueryChange,
  onToggleFilter,
  onViewModeChange,
  onMeasurementDisplayModeChange,
  onToggleSection,
  onToggleItem,
  onResetChecks,
  onOpenEdit,
}: RoutePageProps) {
  const { messages } = useI18n();
  const [isResetTicksModalOpen, setIsResetTicksModalOpen] = useState(false);
  const routeTitle = listName.trim() || messages.pages.route.title;
  const showDefaultSubtitle = !listName.trim();
  const viewOptions: Array<{ mode: RouteViewMode; icon: string }> = [
    { mode: 'default', icon: mdiViewAgendaOutline },
    { mode: 'comfortable', icon: mdiViewDayOutline },
    { mode: 'compact', icon: mdiViewListOutline },
  ];
  const measurementOptions: Array<{ mode: MeasurementDisplayMode; icon: string; label: string }> = [
    { mode: 'metric', icon: mdiRuler, label: messages.labels.measurementModeMetric },
    { mode: 'imperial', icon: mdiWeightPound, label: messages.labels.measurementModeImperial },
    { mode: 'cooking', icon: mdiCupOutline, label: messages.labels.measurementModeCooking },
  ];
  const confirmResetTicks = () => {
    onResetChecks();
    setIsResetTicksModalOpen(false);
  };

  useEffect(() => {
    if (!isResetTicksModalOpen) { return; }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsResetTicksModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isResetTicksModalOpen]);

  return (
    <Card
      header={
        <div className={p.routePageHeader}>
          <div className={p.routePageHeaderCopy}>
            <div className={p.pageTitleWithStatus}>
              <h2 className={p.titleMd}>{routeTitle}</h2>
              <SaveStatusIndicator status={saveStatus} />
            </div>
            {showDefaultSubtitle ? <p className={p.subtitle}>{messages.pages.route.subtitle}</p> : null}
          </div>
          <div className={p.routeToolbar}>
            <div className={p.routeToolbarRow}>
              <div className={p.routeToolbarGroup}>
                <button type={'button'} className={p.routeEditButton} onClick={onOpenEdit}>
                  {messages.actions.backToEdit}
                </button>
              </div>
              <div className={p.routeToolbarGroup}>
                <div className={p.routeViewControls} role={'group'} aria-label={messages.pages.route.title}>
                  {viewOptions.map((option) => (
                    <button
                      key={option.mode}
                      type={'button'}
                      className={viewMode === option.mode ? classNames(p.buttonIcon, p.buttonActive) : p.buttonIcon}
                      onClick={() => onViewModeChange(option.mode)}
                      aria-label={getRouteViewLabel(option.mode, messages)}
                      aria-pressed={viewMode === option.mode}
                      title={getRouteViewLabel(option.mode, messages)}
                    >
                      <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                        <path d={option.icon} fill={'currentColor'} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className={p.routeToolbarGroup}>
                <div className={p.measurementModeControls} role={'group'} aria-label={messages.labels.measurementMode}>
                  {measurementOptions.map((option) => (
                    <button
                      key={option.mode}
                      type={'button'}
                      className={measurementDisplayMode === option.mode ? classNames(p.buttonIcon, p.buttonActive) : p.buttonIcon}
                      onClick={() => onMeasurementDisplayModeChange(option.mode)}
                      aria-label={option.label}
                      aria-pressed={measurementDisplayMode === option.mode}
                      title={option.label}
                    >
                      <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                        <path d={option.icon} fill={'currentColor'} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div className={p.routeToolbarGroup}>
                <button
                  type={'button'}
                  className={isFilterVisible ? classNames(p.buttonIcon, p.buttonActive) : p.buttonIcon}
                  onClick={onToggleFilter}
                  aria-label={messages.actions.filterItems}
                  aria-pressed={isFilterVisible}
                  aria-expanded={isFilterVisible}
                  aria-controls={isFilterVisible ? 'route-filter-input' : undefined}
                  title={messages.actions.filterItems}
                >
                  <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                    <path d={mdiMagnify} fill={'currentColor'} />
                  </svg>
                </button>
              </div>
            </div>
            {isFilterVisible ? (
              <input
                id={'route-filter-input'}
                className={p.routeFilterInput}
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
      <div className={p.stack}>
        {!hasItems ? (
          <div className={p.emptyStateStack}>
            <div>{messages.pages.route.emptyNoItems}</div>
            <div className={classNames(p.buttonRow, p.warningActions)}>
              <button type={'button'} className={p.buttonPrimary} onClick={onOpenEdit}>
                {messages.actions.goToEditList}
              </button>
            </div>
          </div>
        ) : grouped.length === 0 ? (
          <div className={p.emptyState}>{messages.pages.route.emptyNoResults}</div>
        ) : (
          <>
            {grouped.map((section) => (
              <RouteSectionCard
                key={section.key}
                section={section}
                viewMode={viewMode}
                onToggleSection={onToggleSection}
                onToggleItem={onToggleItem}
              />
            ))}
          </>
        )}
        {hasItems ? (
          <div className={p.routeResetActions}>
            <button type={'button'} className={p.button} onClick={() => setIsResetTicksModalOpen(true)}>
              {messages.actions.resetTicks}
            </button>
          </div>
        ) : null}
      </div>
      {isResetTicksModalOpen ? (
        <div className={classNames(sharedSt.scannerModal, sharedSt.shareScannerModal)} onClick={() => setIsResetTicksModalOpen(false)} role={'presentation'}>
          <div
            className={classNames(sharedSt.scannerDialog, sharedSt.shareScannerDialog, p.stack)}
            role={'dialog'}
            aria-modal={'true'}
            aria-labelledby={'reset-ticks-title'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={p.stack}>
              <h3 id={'reset-ticks-title'} className={p.titleXs}>{messages.pages.route.resetTicksConfirmTitle}</h3>
              <p className={p.subtitle}>{messages.pages.route.resetTicksConfirmBody}</p>
            </div>
            <div className={classNames(p.buttonRow, p.warningActions)}>
              <button type={'button'} className={p.button} onClick={() => setIsResetTicksModalOpen(false)} autoFocus>
                {messages.actions.close}
              </button>
              <button type={'button'} className={p.buttonDanger} onClick={confirmResetTicks}>
                {messages.pages.route.resetTicksConfirmAction}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
