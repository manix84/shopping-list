import type { CountryConfig, Item } from '../types';
import { Card } from '../components/Card';
import { StatsGrid } from '../components/StatsGrid';
import { ParsedItemCard } from '../components/ParsedItemCard';
import { DebugLink } from '../components/DebugLink';
import { useI18n } from '../lib/i18n';

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
  onCreateSharedLink: () => void;
  onRefreshSharedList: () => void;
  onOpenDebug: () => void;
  canUseBackend: boolean;
  shareLink?: string;
  isCreatingShareLink: boolean;
  isRefreshingSharedList: boolean;
  shareError?: string;
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
  onCreateSharedLink,
  onRefreshSharedList,
  onOpenDebug,
  canUseBackend,
  shareLink,
  isCreatingShareLink,
  isRefreshingSharedList,
  shareError,
}: EditPageProps) {
  const { messages } = useI18n();

  return (
    <div className="layout-split">
      <Card
        header={
          <>
            <h2 className="title title-sm">{messages.pages.edit.title}</h2>
            <p className="subtitle">{messages.pages.edit.subtitle}</p>
          </>
        }
        bodyClassName="stack"
      >
        <div className="field">
          <label htmlFor="shopping-list-input">{messages.pages.edit.pasteLabel}</label>
          <textarea
            id="shopping-list-input"
            className="textarea"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={messages.pages.edit.pastePlaceholder}
          />
        </div>

        <div className="field">
          <label htmlFor="shopping-quick-add">{messages.pages.edit.quickAddLabel}</label>
          <div className="inline-row quick-add-row">
            <input
              id="shopping-quick-add"
              className="input"
              value={draftItem}
              onChange={(event) => onDraftItemChange(event.target.value)}
              placeholder={messages.pages.edit.quickAddPlaceholder}
            />
            <button
              type="button"
              className="button button-primary button-icon"
              onClick={onAddSingleItem}
              aria-label={messages.actions.add}
              title={messages.actions.add}
            >
              <span aria-hidden="true" className="button-icon-plus" />
            </button>
          </div>
        </div>

        <div className="button-row">
          <button type="button" className="button button-primary" onClick={onParse}>
            {messages.actions.saveAndSort}
          </button>
          <button type="button" className="button" onClick={onResetAll}>
            {messages.actions.fullReset}
          </button>
        </div>

        <div className="separator" />
        <StatsGrid total={total} checkedTotal={checkedTotal} progress={progress} />
      </Card>

      <div className="stack">
        <Card
          header={
            <>
              <h2 className="title title-sm">{messages.pages.edit.sharingTitle}</h2>
              <p className="subtitle">{messages.pages.edit.sharingSubtitle}</p>
            </>
          }
          bodyClassName="stack"
        >
          {shareLink ? (
            <>
              <div className="field">
                <label htmlFor="shopping-share-link">{messages.labels.sharedLink}</label>
                <div className="inline-row">
                  <input id="shopping-share-link" className="input" readOnly value={shareLink} />
                  <button type="button" className="button" onClick={() => void navigator.clipboard?.writeText(shareLink)}>
                    {messages.actions.copy}
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={onRefreshSharedList}
                    disabled={isRefreshingSharedList || !canUseBackend}
                  >
                    {isRefreshingSharedList ? messages.actions.refreshing : messages.actions.refresh}
                  </button>
                </div>
              </div>
              {shareError ? <div className="small-text">{shareError}</div> : null}
            </>
          ) : canUseBackend ? (
            <>
              <button
                type="button"
                className="button button-primary"
                onClick={onCreateSharedLink}
                disabled={isCreatingShareLink}
              >
                {isCreatingShareLink ? messages.actions.creating : messages.actions.createSharedLink}
              </button>
              {shareError ? <div className="small-text">{shareError}</div> : null}
            </>
          ) : (
            <div className="empty-state">{messages.pages.edit.sharingUnavailable}</div>
          )}
        </Card>

        <Card
          header={
            <>
              <h2 className="title title-sm">{messages.pages.edit.parsedTitle}</h2>
              <p className="subtitle">{messages.pages.edit.parsedSubtitle}</p>
            </>
          }
        >
          <div className="scroll-region stack">
            {items.length === 0 ? (
              <div className="empty-state">{messages.pages.edit.parsedEmpty}</div>
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
