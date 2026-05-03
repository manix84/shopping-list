import type { GroupedSectionView, RouteViewMode } from '../types';
import { getQuantityDisplayValue, getSizeValue, getUnitQuantityDisplayValue, getVariantPrefixedDisplayValue } from '../lib/parser';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';

type RouteSectionCardProps = {
  section: GroupedSectionView;
  viewMode: RouteViewMode;
  onToggleSection: (sectionKey: GroupedSectionView['key'], checked: boolean) => void;
  onToggleItem: (id: string) => void;
};

export function RouteSectionCard({ section, viewMode, onToggleSection, onToggleItem }: RouteSectionCardProps) {
  const { messages } = useI18n();
  const isCompact = viewMode === 'compact';
  const allChecked = section.checkedCount === section.items.length && section.items.length > 0;
  const noneChecked = section.checkedCount === 0;
  const toggleTarget = !allChecked;
  const state = allChecked ? 'checked' : noneChecked ? 'unchecked' : 'mixed';
  const actionLabel = allChecked ? messages.sectionToggle.untickAll : messages.sectionToggle.tickAll;
  const sectionTitleId = `route-section-${section.key}-title`;

  return (
    <section className={`section-card section-card-${viewMode}`} aria-labelledby={sectionTitleId}>
      <div className={'section-header'}>
        <div className={'section-heading'}>
          <div className={'section-group'}>{section.groupLabel}</div>
          <h3 id={sectionTitleId} className={'section-title'}>{section.label}</h3>
          {!isCompact ? (
            <div className={'badge-row'}>
              <Badge>
                {section.checkedCount}/{section.items.length}
              </Badge>
              {section.complete ? <Badge tone={'success'}>{messages.labels.done}</Badge> : null}
            </div>
          ) : null}
        </div>
        {!isCompact ? (
          <button
            type={'button'}
            className={`section-toggle section-toggle-${state}`}
            onClick={() => onToggleSection(section.key, toggleTarget)}
            aria-label={`${actionLabel}: ${section.label}`}
            title={actionLabel}
          >
            {state === 'checked' ? (
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Zm2.02 5.38 1.9 1.9 4.34-4.34 1.06 1.06-5.4 5.4-2.96-2.96 1.06-1.06Z'} />
              </svg>
            ) : state === 'mixed' ? (
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Zm2 4.75h7v1.5h-7v-1.5Z'} />
              </svg>
            ) : (
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Z'} />
              </svg>
            )}
          </button>
        ) : null}
      </div>

      <div className={'section-items'}>
        {section.items.map((item) => (
          <label key={item.id} className={`check-row ${item.checked ? 'is-checked' : ''}`}>
            <div className={'check-label'}>
              <input type={'checkbox'} checked={item.checked} onChange={() => onToggleItem(item.id)} />
              <div className={'check-text'}>
                <div className={'check-text-line'}>
                  <div className={`check-text-main ${item.checked ? 'is-checked' : ''}`}>
                    {getVariantPrefixedDisplayValue(item)}
                  </div>
                  {getSizeValue(item) ? (
                    <div className={'check-text-quantity'}>
                      <Badge>{getSizeValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getQuantityDisplayValue(item) ? (
                    <div className={'check-text-quantity'}>
                      <Badge>{getQuantityDisplayValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getUnitQuantityDisplayValue(item) ? (
                    <div className={'check-text-quantity'}>
                      <Badge>{getUnitQuantityDisplayValue(item)}</Badge>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {!isCompact ? <Badge>{section.label}</Badge> : null}
          </label>
        ))}
      </div>
    </section>
  );
}
