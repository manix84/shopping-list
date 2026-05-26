import type { GroupedSectionView, RouteViewMode } from '../types';
import { getQuantityDisplayValue, getSizeValue, getUnitQuantityDisplayValue, getVariantPrefixedDisplayValue } from '../lib/parser';
import { classNames } from '../lib/classNames';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';
import st from './RouteSectionCard.module.scss';

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
  const viewModeClassName = viewMode === 'comfortable'
    ? st.comfortable
    : viewMode === 'compact'
      ? st.compact
      : undefined;
  const toggleStateClassName = state === 'checked'
    ? st.toggleChecked
    : state === 'mixed'
      ? st.toggleMixed
      : st.toggleUnchecked;

  return (
    <section className={classNames(st.root, viewModeClassName, 'section-card', `section-card-${viewMode}`)} aria-labelledby={sectionTitleId}>
      <div className={classNames(st.header, 'section-header')}>
        <div className={classNames(st.heading, 'section-heading')}>
          <div className={classNames(st.group, 'section-group')}>{section.groupLabel}</div>
          <h3 id={sectionTitleId} className={classNames(st.title, 'section-title')}>{section.label}</h3>
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
            className={classNames(st.toggle, toggleStateClassName, 'section-toggle', `section-toggle-${state}`)}
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

      <div className={classNames(st.items, 'section-items')}>
        {section.items.map((item) => (
          <label key={item.id} className={classNames(st.checkRow, 'check-row', item.checked ? st.checked : undefined, item.checked ? 'is-checked' : undefined)}>
            <div className={classNames(st.checkLabel, 'check-label')}>
              <input type={'checkbox'} checked={item.checked} onChange={() => onToggleItem(item.id)} />
              <div className={classNames(st.text, 'check-text')}>
                <div className={classNames(st.textLine, 'check-text-line')}>
                  <div className={classNames(st.textMain, 'check-text-main', item.checked ? st.textMainChecked : undefined, item.checked ? 'is-checked' : undefined)}>
                    {getVariantPrefixedDisplayValue(item)}
                  </div>
                  {getSizeValue(item) ? (
                    <div className={classNames(st.quantity, 'check-text-quantity')}>
                      <Badge>{getSizeValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getQuantityDisplayValue(item) ? (
                    <div className={classNames(st.quantity, 'check-text-quantity')}>
                      <Badge>{getQuantityDisplayValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getUnitQuantityDisplayValue(item) ? (
                    <div className={classNames(st.quantity, 'check-text-quantity')}>
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
