import type { CountryConfig, Item } from '../types';
import { Card } from '../components/Card';
import { StatsGrid } from '../components/StatsGrid';
import { ParsedItemCard } from '../components/ParsedItemCard';
import { DebugLink } from '../components/DebugLink';

type EditPageProps = {
  input: string;
  items: Item[];
  draftItem: string;
  total: number;
  checkedTotal: number;
  progress: number;
  config: CountryConfig;
  onInputChange: (value: string) => void;
  onDraftItemChange: (value: string) => void;
  onParse: () => void;
  onResetAll: () => void;
  onAddSingleItem: () => void;
  onRenameItem: (itemId: string, nextRaw: string) => void;
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenDebug: () => void;
};

export function EditPage({
  input,
  items,
  draftItem,
  total,
  checkedTotal,
  progress,
  config,
  onInputChange,
  onDraftItemChange,
  onParse,
  onResetAll,
  onAddSingleItem,
  onRenameItem,
  onToggleItem,
  onDeleteItem,
  onOpenDebug,
}: EditPageProps) {
  return (
    <div className="layout-split">
      <Card
        header={
          <>
            <h2 className="title title-sm">List editor</h2>
            <p className="subtitle">Paste from anywhere, tweak the list, and save it locally for now.</p>
          </>
        }
        bodyClassName="stack"
      >
        <div className="field">
          <label htmlFor="shopping-list-input">Paste or type your list</label>
          <textarea
            id="shopping-list-input"
            className="textarea"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={'milk\nbread\napples\ncoffee'}
          />
        </div>

        <div className="field">
          <label htmlFor="shopping-quick-add">Quick add single item</label>
          <div className="inline-row">
            <input
              id="shopping-quick-add"
              className="input"
              value={draftItem}
              onChange={(event) => onDraftItemChange(event.target.value)}
              placeholder="e.g. bananas x20"
            />
            <button className="button button-primary" onClick={onAddSingleItem}>Add</button>
          </div>
        </div>

        <div className="button-row">
          <button className="button button-primary" onClick={onParse}>Save and sort</button>
          <button className="button" onClick={onResetAll}>Full reset</button>
        </div>

        <div className="separator" />
        <StatsGrid total={total} checkedTotal={checkedTotal} progress={progress} />
      </Card>

      <div className="stack">
        <Card
          header={
            <>
              <h2 className="title title-sm">Parsed items</h2>
              <p className="subtitle">Structured items, ready for local storage today and a database later.</p>
            </>
          }
        >
          <div className="scroll-region stack">
            {items.length === 0 ? (
              <div className="empty-state">Save and sort the list to generate structured shopping items.</div>
            ) : (
              items.map((item) => (
                <ParsedItemCard
                  key={item.id}
                  item={item}
                  config={config}
                  onRename={onRenameItem}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
              ))
            )}
          </div>
        </Card>

        <DebugLink onOpen={onOpenDebug} />
      </div>
    </div>
  );
}
