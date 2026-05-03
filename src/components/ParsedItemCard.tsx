import type { Item, CountryConfig } from '../types';
import { getDisplayValue, getQuantityValue, getSizeValue, getUnitQuantityDisplayValue, getVariantValue } from '../lib/parser';
import { getSectionMeta } from '../lib/sections';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';

type ParsedItemCardProps = {
  item: Item;
  config: CountryConfig;
  onRename: (itemId: string, nextRaw: string) => void;
  onToggle: (itemId: string) => void;
  onDelete: (itemId: string) => void;
};

export function ParsedItemCard({ item, config, onRename, onToggle, onDelete }: ParsedItemCardProps) {
  const { messages } = useI18n();
  const meta = getSectionMeta(config, item.matchedSection);
  const displayValue = getDisplayValue(item);
  const variantValue = getVariantValue(item);

  return (
    <div className={'item-card'}>
      <div className={'item-row'}>
        <div className={'item-main'}>
          <input
            className={'input'}
            defaultValue={displayValue}
            aria-label={`${messages.actions.editList}: ${displayValue}`}
            onBlur={(event) => {
              const nextValue = event.target.value.trim().replace(/\s+/g, ' ');
              if (nextValue !== displayValue) {
                onRename(item.id, nextValue);
              }
            }}
          />
          <div className={'badge-row'}>
            <Badge>
              {messages.labels.cleaned}: {item.cleaned}
            </Badge>
            {variantValue ? (
              <Badge>
                {messages.labels.variant}: {variantValue}
              </Badge>
            ) : null}
            <Badge>
              {messages.labels.section}: {meta.label}
            </Badge>
            <Badge>
              {messages.labels.group}: {meta.groupLabel}
            </Badge>
            {getSizeValue(item) ? (
              <Badge>
                {messages.labels.size}: {getSizeValue(item)}
              </Badge>
            ) : null}
            {getQuantityValue(item) ? (
              <Badge>
                {messages.labels.qty}: {getQuantityValue(item)}
              </Badge>
            ) : null}
            {getUnitQuantityDisplayValue(item) ? <Badge>{getUnitQuantityDisplayValue(item)}</Badge> : null}
          </div>
        </div>
        <div className={'button-row'}>
          <button type={'button'} className={'button'} onClick={() => onToggle(item.id)}>
            {item.checked ? messages.actions.untick : messages.actions.tick}
          </button>
          <button type={'button'} className={'button button-danger'} onClick={() => onDelete(item.id)}>
            {messages.actions.remove}
          </button>
        </div>
      </div>
    </div>
  );
}
