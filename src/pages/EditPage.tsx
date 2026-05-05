import { mdiContentSave, mdiDirections, mdiPlus } from '@mdi/js';
import { Card } from '../components/Card';
import { CountrySelect } from '../components/CountrySelect';
import { SaveStatusIndicator } from '../components/SaveStatusIndicator';
import { StatsGrid } from '../components/StatsGrid';
import { SharedListPanel } from '../components/SharedListPanel';
import { useI18n } from '../lib/i18n';
import type { CountryCode, SaveStatus, SharedListHistoryEntry } from '../types';

type EditPageProps = {
  input: string;
  listName: string;
  draftItem: string;
  total: number;
  checkedTotal: number;
  progress: number;
  countryCode: CountryCode;
  saveStatus: SaveStatus;
  onInputChange: (value: string) => void;
  onListNameChange: (value: string) => void;
  onDraftItemChange: (value: string) => void;
  onCountryChange: (countryCode: CountryCode) => void;
  onParse: () => void;
  onSaveAndStay: () => void;
  onResetAll: () => void;
  onAddSingleItem: () => void;
  onCreateSharedLink: () => void;
  onRefreshSharedList: () => void;
  canUseBackend: boolean;
  canCreateSharedLink: boolean;
  resolvedTheme: 'light' | 'dark';
  shareLink?: string;
  isCreatingShareLink: boolean;
  isRefreshingSharedList: boolean;
  isLoadingSharedList: boolean;
  shareError?: string;
  sharedListHistory: SharedListHistoryEntry[];
  onLoadSharedInput: (value: string) => Promise<boolean>;
  onValidateSharedInput: (value: string) => Promise<
    | { state: 'valid'; listId: string; normalizedValue: string }
    | { state: 'invalid' }
    | { state: 'missing'; listId: string; normalizedValue: string }
    | { state: 'unavailable' }
  >;
  onLoadSharedListFromHistory: (listId: string) => Promise<boolean>;
  onDeleteSharedListFromHistory: (listId: string) => void;
};

export function EditPage({
  input,
  listName,
  draftItem,
  total,
  checkedTotal,
  progress,
  countryCode,
  saveStatus,
  onInputChange,
  onListNameChange,
  onDraftItemChange,
  onCountryChange,
  onParse,
  onSaveAndStay,
  onResetAll,
  onAddSingleItem,
  onCreateSharedLink,
  onRefreshSharedList,
  canUseBackend,
  canCreateSharedLink,
  resolvedTheme,
  shareLink,
  isCreatingShareLink,
  isRefreshingSharedList,
  isLoadingSharedList,
  shareError,
  sharedListHistory,
  onLoadSharedInput,
  onValidateSharedInput,
  onLoadSharedListFromHistory,
  onDeleteSharedListFromHistory,
}: EditPageProps) {
  const { messages } = useI18n();

  return (
    <div className={'layout-split'}>
      <Card
        header={
          <div className={'title-row edit-page-header'}>
            <div className={'edit-page-header-copy'}>
              <div className={'page-title-with-status'}>
                <h2 className={'title title-sm'}>{messages.pages.edit.title}</h2>
                <SaveStatusIndicator status={saveStatus} />
              </div>
              <p className={'subtitle'}>{messages.pages.edit.subtitle}</p>
            </div>
            <button type={'button'} className={'button edit-reset-all-button'} onClick={onResetAll}>
              {messages.actions.fullReset}
            </button>
          </div>
        }
        bodyClassName={'stack'}
      >
        <div className={'field field-compact'}>
          <label htmlFor={'list-country-select'}>{messages.pages.settings.countryLabel}</label>
          <CountrySelect id={'list-country-select'} value={countryCode} onChange={onCountryChange} />
          <div className={'small-text'}>{messages.pages.edit.countryProfileHint}</div>
        </div>

        <div className={'field'}>
          <label htmlFor={'shopping-list-input'}>{messages.pages.edit.pasteLabel}</label>
          <textarea
            id={'shopping-list-input'}
            className={'textarea'}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={messages.pages.edit.pastePlaceholder}
          />
        </div>

        <div className={'field'}>
          <label htmlFor={'shopping-quick-add'}>{messages.pages.edit.quickAddLabel}</label>
          <div className={'inline-row quick-add-row'}>
            <input
              id={'shopping-quick-add'}
              className={'input'}
              value={draftItem}
              onChange={(event) => onDraftItemChange(event.target.value)}
              placeholder={messages.pages.edit.quickAddPlaceholder}
            />
            <button
              type={'button'}
              className={'button button-primary button-icon'}
              onClick={onAddSingleItem}
              aria-label={messages.actions.add}
              title={messages.actions.add}
            >
              <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
                <path d={mdiPlus} fill={'currentColor'} />
              </svg>
            </button>
          </div>
        </div>

        <div className={'field'}>
          <label htmlFor={'shopping-list-name'}>{messages.pages.edit.listNameLabel}</label>
          <input
            id={'shopping-list-name'}
            className={'input'}
            value={listName}
            onChange={(event) => onListNameChange(event.target.value)}
            placeholder={messages.pages.edit.listNamePlaceholder}
          />
          <div className={'small-text'}>{messages.pages.edit.listNameHint}</div>
        </div>

        <div className={'edit-save-actions'}>
          <button
            type={'button'}
            className={'button'}
            onClick={onSaveAndStay}
          >
            <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
              <path d={mdiContentSave} fill={'currentColor'} />
            </svg>
            {messages.actions.saveAndStay}
          </button>
          <button
            type={'button'}
            className={'button button-primary'}
            onClick={onParse}
          >
            <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
              <path d={mdiDirections} fill={'currentColor'} />
            </svg>
            {messages.actions.saveAndRoute}
          </button>
        </div>

        <div className={'separator'} />
        <StatsGrid total={total} checkedTotal={checkedTotal} progress={progress} />
      </Card>

      <div className={'stack'}>
        <Card
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.edit.sharingTitle}</h2>
              <p className={'subtitle'}>{messages.pages.edit.sharingSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          <SharedListPanel
            listName={listName}
            canUseBackend={canUseBackend}
            canCreateSharedLink={canCreateSharedLink}
            resolvedTheme={resolvedTheme}
            shareLink={shareLink}
            isCreatingShareLink={isCreatingShareLink}
            isRefreshingSharedList={isRefreshingSharedList}
            isLoadingSharedList={isLoadingSharedList}
            shareError={shareError}
            historyEntries={sharedListHistory}
            onCreateSharedLink={onCreateSharedLink}
            onRefreshSharedList={onRefreshSharedList}
            onLoadSharedInput={onLoadSharedInput}
            onValidateSharedInput={onValidateSharedInput}
            onLoadHistoryEntry={onLoadSharedListFromHistory}
            onDeleteHistoryEntry={onDeleteSharedListFromHistory}
          />
        </Card>

      </div>
    </div>
  );
}
