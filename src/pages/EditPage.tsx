import { mdiContentSave, mdiPlus } from '@mdi/js';
import { Card } from '../components/Card';
import { CountrySelect } from '../components/CountrySelect';
import { StatsGrid } from '../components/StatsGrid';
import { SharedListPanel } from '../components/SharedListPanel';
import { useI18n } from '../lib/i18n';
import type { CountryCode, SharedListHistoryEntry } from '../types';

type EditPageProps = {
  input: string;
  draftItem: string;
  total: number;
  checkedTotal: number;
  progress: number;
  countryCode: CountryCode;
  onInputChange: (value: string) => void;
  onDraftItemChange: (value: string) => void;
  onCountryChange: (countryCode: CountryCode) => void;
  onParse: () => void;
  onResetAll: () => void;
  onResetChecks: () => void;
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
  draftItem,
  total,
  checkedTotal,
  progress,
  countryCode,
  onInputChange,
  onDraftItemChange,
  onCountryChange,
  onParse,
  onResetAll,
  onResetChecks,
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
          <>
            <h2 className={'title title-sm'}>{messages.pages.edit.title}</h2>
            <p className={'subtitle'}>{messages.pages.edit.subtitle}</p>
          </>
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
            <button
              type={'button'}
              className={'button button-primary button-icon'}
              onClick={onParse}
              aria-label={messages.actions.saveAndSort}
              title={messages.actions.saveAndSort}
            >
              <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
                <path d={mdiContentSave} fill={'currentColor'} />
              </svg>
            </button>
          </div>
        </div>

        <div className={'button-row'}>
          <button type={'button'} className={'button'} onClick={onResetChecks}>
            {messages.actions.resetTicks}
          </button>
          <button type={'button'} className={'button'} onClick={onResetAll}>
            {messages.actions.fullReset}
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
