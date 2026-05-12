import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { mdiContentSave, mdiDirections } from '@mdi/js';
import { Card } from '../components/Card';
import { CountrySelect } from '../components/CountrySelect';
import { SaveStatusIndicator } from '../components/SaveStatusIndicator';
import { StatsGrid } from '../components/StatsGrid';
import { SharedListPanel } from '../components/SharedListPanel';
import { useI18n } from '../lib/i18n';
import { filterProductSuggestions, type ProductSuggestion } from '../lib/productSuggestions';
import type { CountryCode, SaveStatus, SharedListHistoryEntry } from '../types';

type EditPageProps = {
  input: string;
  listName: string;
  productSuggestions: ProductSuggestion[];
  total: number;
  checkedTotal: number;
  progress: number;
  countryCode: CountryCode;
  saveStatus: SaveStatus;
  onInputChange: (value: string) => void;
  onListNameChange: (value: string) => void;
  onCountryChange: (countryCode: CountryCode) => void;
  onParse: () => void;
  onSaveAndStay: () => void;
  onResetAll: () => void;
  onCreateSharedLink: () => void;
  onRefreshSharedList: () => void;
  onAutocompleteInteractionChange: (isInteracting: boolean) => void;
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

type TextareaSuggestionState = {
  activeIndex: number;
  isOpen: boolean;
  lineEnd: number;
  lineStart: number;
  position: {
    left: number;
    top: number;
  };
  query: string;
};

const textareaLineAtCaret = (value: string, caretPosition: number) => {
  const lineStart = value.lastIndexOf('\n', Math.max(0, caretPosition - 1)) + 1;
  const nextLineBreak = value.indexOf('\n', caretPosition);
  const lineEnd = nextLineBreak === -1 ? value.length : nextLineBreak;
  return {
    lineEnd,
    lineStart,
    query: value.slice(lineStart, caretPosition),
  };
};

const textareaCaretPosition = (textarea: HTMLTextAreaElement, caretPosition: number) => {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');
  const marker = document.createElement('span');
  const properties = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'textTransform',
    'width',
    'wordSpacing',
  ] as const;

  for (const property of properties) {
    mirror.style[property] = style[property];
  }

  mirror.style.height = 'auto';
  mirror.style.left = '-9999px';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.position = 'absolute';
  mirror.style.top = '0';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordBreak = 'break-word';
  mirror.textContent = textarea.value.slice(0, caretPosition);
  marker.textContent = textarea.value.slice(caretPosition, caretPosition + 1) || '\u200b';
  mirror.append(marker);
  document.body.append(mirror);

  const position = {
    left: textarea.offsetLeft + marker.offsetLeft - textarea.scrollLeft,
    top: textarea.offsetTop + marker.offsetTop - textarea.scrollTop,
  };
  mirror.remove();
  return position;
};

export function EditPage({
  input,
  listName,
  productSuggestions,
  total,
  checkedTotal,
  progress,
  countryCode,
  saveStatus,
  onInputChange,
  onListNameChange,
  onCountryChange,
  onParse,
  onSaveAndStay,
  onResetAll,
  onCreateSharedLink,
  onRefreshSharedList,
  onAutocompleteInteractionChange,
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
  const textareaSuggestionListId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textareaSuggestion, setTextareaSuggestion] = useState<TextareaSuggestionState>({
    activeIndex: -1,
    isOpen: false,
    lineEnd: 0,
    lineStart: 0,
    position: { left: 14, top: 14 },
    query: '',
  });
  const visibleTextareaSuggestions = useMemo(
    () => filterProductSuggestions(productSuggestions, textareaSuggestion.query),
    [productSuggestions, textareaSuggestion.query],
  );
  const isTextareaSuggestionListVisible = textareaSuggestion.isOpen && visibleTextareaSuggestions.length > 0;
  const activeTextareaSuggestion = textareaSuggestion.activeIndex >= 0
    ? visibleTextareaSuggestions[textareaSuggestion.activeIndex]
    : undefined;
  const activeTextareaSuggestionId = activeTextareaSuggestion
    ? `${textareaSuggestionListId}-option-${textareaSuggestion.activeIndex}`
    : undefined;
  const isAutocompleteInteracting = isTextareaSuggestionListVisible;
  const textareaSuggestionStyle = {
    left: `${textareaSuggestion.position.left}px`,
    top: `${textareaSuggestion.position.top}px`,
  } satisfies CSSProperties;

  useEffect(() => {
    onAutocompleteInteractionChange(isAutocompleteInteracting);
    return () => onAutocompleteInteractionChange(false);
  }, [isAutocompleteInteracting, onAutocompleteInteractionChange]);

  const updateTextareaSuggestion = (textarea: HTMLTextAreaElement, nextValue = textarea.value) => {
    const caretPosition = textarea.selectionStart ?? nextValue.length;
    const line = textareaLineAtCaret(nextValue, caretPosition);
    const position = textareaCaretPosition(textarea, caretPosition);
    const maxLeft = Math.max(6, textarea.clientWidth - 286);
    setTextareaSuggestion({
      activeIndex: -1,
      isOpen: true,
      lineEnd: line.lineEnd,
      lineStart: line.lineStart,
      position: {
        left: Math.max(6, Math.min(position.left, maxLeft)),
        top: position.top,
      },
      query: line.query,
    });
  };

  const closeTextareaSuggestions = () => {
    setTextareaSuggestion((current) => ({ ...current, isOpen: false }));
  };

  const selectTextareaSuggestion = (suggestion: ProductSuggestion, sourceTextarea = textareaRef.current) => {
    const textarea = sourceTextarea;
    const currentInput = textarea?.value ?? input;
    const currentLine = textarea
      ? textareaLineAtCaret(currentInput, textarea.selectionStart ?? currentInput.length)
      : textareaSuggestion;
    const nextInput = `${currentInput.slice(0, currentLine.lineStart)}${suggestion.value}${currentInput.slice(currentLine.lineEnd)}`;
    const nextCaretPosition = currentLine.lineStart + suggestion.value.length;
    onInputChange(nextInput);
    closeTextareaSuggestions();
    window.setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition);
    });
  };

  const handleTextareaChange = (value: string, textarea: HTMLTextAreaElement) => {
    onInputChange(value);
    updateTextareaSuggestion(textarea, value);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'ArrowDown' && visibleTextareaSuggestions.length > 0) {
      event.preventDefault();
      setTextareaSuggestion((current) => ({
        ...current,
        activeIndex: current.activeIndex < 0 ? 0 : (current.activeIndex + 1) % visibleTextareaSuggestions.length,
        isOpen: true,
      }));
      return;
    }

    if (event.key === 'ArrowUp' && visibleTextareaSuggestions.length > 0) {
      event.preventDefault();
      setTextareaSuggestion((current) => ({
        ...current,
        activeIndex: current.activeIndex < 0
          ? visibleTextareaSuggestions.length - 1
          : (current.activeIndex - 1 + visibleTextareaSuggestions.length) % visibleTextareaSuggestions.length,
        isOpen: true,
      }));
      return;
    }

    if ((event.key === 'Enter' || event.key === 'Tab') && isTextareaSuggestionListVisible && activeTextareaSuggestion) {
      event.preventDefault();
      selectTextareaSuggestion(activeTextareaSuggestion, event.currentTarget);
      return;
    }

    if (event.key === 'Escape') {
      closeTextareaSuggestions();
    }
  };

  const handleTextareaKeyUp = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
      return;
    }

    updateTextareaSuggestion(event.currentTarget);
  };

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
          <div className={'paste-autocomplete-shell'}>
            <textarea
              ref={textareaRef}
              id={'shopping-list-input'}
              className={'textarea'}
              value={input}
              onChange={(event) => handleTextareaChange(event.currentTarget.value, event.currentTarget)}
              onKeyDown={handleTextareaKeyDown}
              onKeyUp={handleTextareaKeyUp}
              onClick={(event) => updateTextareaSuggestion(event.currentTarget)}
              onScroll={(event) => {
                if (textareaSuggestion.isOpen) {
                  updateTextareaSuggestion(event.currentTarget);
                }
              }}
              onBlur={() => window.setTimeout(closeTextareaSuggestions, 120)}
              placeholder={messages.pages.edit.pastePlaceholder}
              aria-autocomplete={'list'}
              aria-controls={isTextareaSuggestionListVisible ? textareaSuggestionListId : undefined}
              aria-activedescendant={isTextareaSuggestionListVisible ? activeTextareaSuggestionId : undefined}
            />
            {isTextareaSuggestionListVisible ? (
              <ul
                id={textareaSuggestionListId}
                className={'product-suggestion-list product-suggestion-list-caret'}
                role={'listbox'}
                style={textareaSuggestionStyle}
              >
                {visibleTextareaSuggestions.map((suggestion, index) => (
                  <li key={`${suggestion.sectionKey}-${suggestion.value}`} role={'presentation'}>
                    <button
                      id={`${textareaSuggestionListId}-option-${index}`}
                      type={'button'}
                      className={`product-suggestion-option${index === textareaSuggestion.activeIndex ? ' product-suggestion-option-active' : ''}`}
                      role={'option'}
                      aria-selected={index === textareaSuggestion.activeIndex}
                      aria-label={`${suggestion.value}, ${suggestion.sectionLabel}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onPointerEnter={() => setTextareaSuggestion((current) => ({ ...current, activeIndex: index }))}
                      onClick={() => selectTextareaSuggestion(suggestion)}
                    >
                      <span className={'product-suggestion-value'}>{suggestion.value}</span>
                      <span className={'product-suggestion-section'}>{suggestion.sectionLabel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
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
