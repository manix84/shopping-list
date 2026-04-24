import type { GroupedSectionView } from '../types';
import { getDisplayValue, getQuantityDisplayValue, getSizeDisplayValue } from '../lib/parser';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';

type RouteSectionCardProps = {
  section: GroupedSectionView;
  onToggleSection: (sectionKey: GroupedSectionView['key'], checked: boolean) => void;
  onToggleItem: (id: string) => void;
};

export function RouteSectionCard({ section, onToggleSection, onToggleItem }: RouteSectionCardProps) {
  const { messages } = useI18n();
  const allChecked = section.checkedCount === section.items.length && section.items.length > 0;
  const noneChecked = section.checkedCount === 0;
  const toggleTarget = allChecked;
  const state = allChecked ? 'checked' : noneChecked ? 'unchecked' : 'mixed';
  const actionLabel = toggleTarget ? messages.sectionToggle.untickAll : messages.sectionToggle.tickAll;

  return (
    <div className="section-card">
      <div className="section-header">
        <div className="section-heading">
          <div className="section-group">{section.groupLabel}</div>
          <h3 className="section-title">{section.label}</h3>
          <div className="badge-row">
            <Badge>
              {section.checkedCount}/{section.items.length}
            </Badge>
            {section.complete ? <Badge tone="success">{messages.labels.done}</Badge> : null}
          </div>
        </div>
        <button
          type="button"
          className={`section-toggle section-toggle-${state}`}
          onClick={() => onToggleSection(section.key, toggleTarget)}
          aria-label={actionLabel}
          title={actionLabel}
        >
          {state === 'checked' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Zm2.02 5.38 1.9 1.9 4.34-4.34 1.06 1.06-5.4 5.4-2.96-2.96 1.06-1.06Z" />
            </svg>
          ) : state === 'mixed' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Zm2 4.75h7v1.5h-7v-1.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5.75A.75.75 0 0 1 5.75 5h12.5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75H5.75a.75.75 0 0 1-.75-.75V5.75Zm1.5.75v11h11v-11h-11Z" />
            </svg>
          )}
        </button>
      </div>

      <div className="section-items">
        {section.items.map((item) => (
          <label key={item.id} className={`check-row ${item.checked ? 'is-checked' : ''}`}>
            <div className="check-label">
              <input type="checkbox" checked={item.checked} onChange={() => onToggleItem(item.id)} />
              <div className="check-text">
                <div className="check-text-line">
                  <div className={`check-text-main ${item.checked ? 'is-checked' : ''}`}>{getDisplayValue(item)}</div>
                  {getSizeDisplayValue(item) ? (
                    <div className="check-text-quantity">
                      <Badge>{getSizeDisplayValue(item)?.replace(/^Size:\s*/i, '')}</Badge>
                    </div>
                  ) : null}
                  {getQuantityDisplayValue(item) ? (
                    <div className="check-text-quantity">
                      <Badge>{getQuantityDisplayValue(item)?.replace(/^Qty:\s*/i, '')}</Badge>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <Badge>{section.label}</Badge>
          </label>
        ))}
      </div>
    </div>
  );
}
