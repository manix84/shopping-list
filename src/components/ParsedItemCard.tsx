import type { Item, CountryConfig } from '../types';
import { getDisplayValue, getQuantityDisplayValue, getSizeDisplayValue } from '../lib/parser';
import { getSectionMeta } from '../lib/sections';
import { Badge } from './Badge';

type ParsedItemCardProps = {
  item: Item;
  config: CountryConfig;
  onRename: (itemId: string, nextRaw: string) => void;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
};

export function ParsedItemCard({ item, config, onRename, onToggle, onDelete }: ParsedItemCardProps) {
  const meta = getSectionMeta(config, item.matchedSection);
  const displayValue = getDisplayValue(item);

  return (
    <div className="item-card">
      <div className="item-row">
        <div className="item-main">
          <input
            className="input"
            defaultValue={displayValue}
            onBlur={(event) => {
              const nextValue = event.target.value.trim().replace(/\s+/g, ' ');
              if (nextValue !== displayValue) {
                onRename(item.id, nextValue);
              }
            }}
          />
          <div className="badge-row">
            <Badge>Cleaned: {item.cleaned}</Badge>
            <Badge>Section: {meta.label}</Badge>
            <Badge>Group: {meta.groupLabel}</Badge>
            {getSizeDisplayValue(item) ? <Badge>{getSizeDisplayValue(item)}</Badge> : null}
            {getQuantityDisplayValue(item) ? <Badge>{getQuantityDisplayValue(item)}</Badge> : null}
          </div>
        </div>
        <div className="button-row">
          <button className="button" onClick={() => onToggle(item.id)}>{item.checked ? 'Untick' : 'Tick'}</button>
          <button className="button button-danger" onClick={() => onDelete(item.id)}>Remove</button>
        </div>
      </div>
    </div>
  );
}
