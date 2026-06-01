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
    ? classNames(st.comfortable, st.sectionCardComfortable)
    : viewMode === 'compact'
      ? classNames(st.compact, st.sectionCardCompact)
      : undefined;
  const toggleStateClassName = state === 'checked'
    ? classNames(st.toggleChecked, st.sectionToggleChecked)
    : state === 'mixed'
      ? classNames(st.toggleMixed, st.sectionToggleMixed)
      : classNames(st.toggleUnchecked, st.sectionToggleUnchecked);

  return (
    <section className={classNames(st.root, st.sectionCard, viewModeClassName)} aria-labelledby={sectionTitleId}>
      <div className={classNames(st.header, st.sectionHeader)}>
        <div className={classNames(st.heading, st.sectionHeading)}>
          <div className={classNames(st.group, st.sectionGroup)}>{section.groupLabel}</div>
          <h3 id={sectionTitleId} className={classNames(st.title, st.sectionTitle)}>{section.label}</h3>
          {!isCompact ? (
            <div className={p.badgeRow}>
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
            className={classNames(st.toggle, st.sectionToggle, toggleStateClassName)}
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

      <div className={classNames(st.items, st.sectionItems)}>
        {section.items.map((item) => (
          <label key={item.id} className={classNames(st.checkRow, st.checkRowAlias, item.checked ? st.checked : undefined, item.checked ? st.isChecked : undefined)}>
            <div className={classNames(st.checkLabel, st.checkLabelAlias)}>
              <input type={'checkbox'} checked={item.checked} onChange={() => onToggleItem(item.id)} />
              <div className={classNames(st.text, st.checkText)}>
                <div className={classNames(st.textLine, st.checkTextLine)}>
                  <div className={classNames(st.textMain, st.checkTextMain, item.checked ? st.textMainChecked : undefined, item.checked ? st.isChecked : undefined)}>
                    {getVariantPrefixedDisplayValue(item)}
                  </div>
                  {getSizeValue(item) ? (
                    <div className={classNames(st.quantity, st.checkTextQuantity)}>
                      <Badge>{getSizeValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getQuantityDisplayValue(item) ? (
                    <div className={classNames(st.quantity, st.checkTextQuantity)}>
                      <Badge>{getQuantityDisplayValue(item)}</Badge>
                    </div>
                  ) : null}
                  {getUnitQuantityDisplayValue(item) ? (
                    <div className={classNames(st.quantity, st.checkTextQuantity)}>
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
