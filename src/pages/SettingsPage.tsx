import { mdiChevronDown } from '@mdi/js';
import { type ReactNode, useMemo, useState } from 'react';
import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryCode, ThemeMode } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { type LocaleCode, useI18n } from '../lib/i18n';

const THEME_OPTIONS: ThemeMode[] = ['system', 'light', 'dark'];

type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type SettingsPageProps = {
  countryCode: CountryCode;
  themeMode: ThemeMode;
  onCountryChange: (countryCode: CountryCode) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onOpenDebug: () => void;
};

type ThemeIconProps = {
  mode: ThemeMode;
};

function ThemeIcon({ mode }: ThemeIconProps) {
  return <span aria-hidden="true" className={`theme-option-icon theme-option-icon-${mode}`} />;
}

function LocaleIcon({ locale }: { locale: LocaleCode }) {
  return (
    <span aria-hidden="true" className="locale-option-icon">
      {locale.toUpperCase()}
    </span>
  );
}

function SettingsSelect<T extends string>({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className="settings-select"
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type="button"
        className="select settings-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="settings-option-content">
          {selectedOption.icon ? <span className="settings-option-icon-slot">{selectedOption.icon}</span> : null}
          <span>{selectedOption.label}</span>
        </span>
        <svg aria-hidden="true" className="settings-select-chevron-svg" viewBox="0 0 24 24">
          <path d={mdiChevronDown} fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <div className="settings-select-menu" role="listbox" aria-labelledby={id}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`settings-select-option ${value === option.value ? 'settings-select-option-active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="settings-option-content">
                {option.icon ? <span className="settings-option-icon-slot">{option.icon}</span> : null}
                <span>{option.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SettingsPage({ countryCode, themeMode, onCountryChange, onThemeChange, onOpenDebug }: SettingsPageProps) {
  const { locale, setLocale, messages } = useI18n();
  const countryOptions = useMemo(
    () =>
      Object.values(COUNTRY_CONFIGS)
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((country): SelectOption<CountryCode> => ({
          value: country.code,
          label: country.label,
          icon: (
            <span aria-hidden="true" className="country-option-icon">
              {country.flag}
            </span>
          ),
        })),
    [],
  );
  const themeOptions = THEME_OPTIONS.map((mode): SelectOption<ThemeMode> => ({
    value: mode,
    label: messages.themeOptions[mode],
    icon: <ThemeIcon mode={mode} />,
  }));
  const localeOptions = Object.entries(messages.localeOptions).map(
    ([value, label]): SelectOption<LocaleCode> => ({
      value: value as LocaleCode,
      label,
      icon: <LocaleIcon locale={value as LocaleCode} />,
    }),
  );

  return (
    <Card
      header={
        <>
          <h2 className="title title-md">{messages.pages.settings.title}</h2>
          <p className="subtitle">{messages.pages.settings.subtitle}</p>
        </>
      }
      bodyClassName="stack"
    >
      <div className="field field-compact">
        <label htmlFor="locale-select">{messages.pages.settings.localeLabel}</label>
        <SettingsSelect
          id="locale-select"
          value={locale}
          options={localeOptions}
          onChange={setLocale}
        />
      </div>

      <div className="field field-compact">
        <label htmlFor="country-select">{messages.pages.settings.countryLabel}</label>
        <SettingsSelect
          id="country-select"
          value={countryCode}
          options={countryOptions}
          onChange={onCountryChange}
        />
      </div>

      <div className="field field-compact">
        <label htmlFor="theme-select">{messages.pages.settings.themeLabel}</label>
        <SettingsSelect id="theme-select" value={themeMode} options={themeOptions} onChange={onThemeChange} />
        <div className="small-text">{messages.labels.storedLocally}</div>
      </div>

      <DebugLink onOpen={onOpenDebug} />
    </Card>
  );
}
