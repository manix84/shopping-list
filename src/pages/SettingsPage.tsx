import { mdiChevronDown } from '@mdi/js';
import { type ReactNode, useState } from 'react';
import type { RouteViewMode, ThemeMode } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { getRouteViewLabel, type LocaleCode, useI18n } from '../lib/i18n';

const THEME_OPTIONS: ThemeMode[] = ['system', 'light', 'dark'];

type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type SettingsPageProps = {
  routeViewMode: RouteViewMode;
  themeMode: ThemeMode;
  onRouteViewModeChange: (mode: RouteViewMode) => void;
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

function RouteDensityPreview({ mode }: { mode: RouteViewMode }) {
  return (
    <span aria-hidden="true" className={`route-density-preview route-density-preview-${mode}`}>
      <span className="route-density-preview-shell">
        <span className="route-density-preview-row">
          <span className="route-density-preview-dot" />
          <span className="route-density-preview-line route-density-preview-line-title" />
        </span>
        <span className="route-density-preview-row">
          <span className="route-density-preview-dot" />
          <span className="route-density-preview-line" />
        </span>
        <span className="route-density-preview-row">
          <span className="route-density-preview-dot" />
          <span className="route-density-preview-line route-density-preview-line-short" />
        </span>
      </span>
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
  const menuId = `${id}-menu`;

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
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
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
        <div id={menuId} className="settings-select-menu" role="listbox" aria-labelledby={id}>
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

export function SettingsPage({
  routeViewMode,
  themeMode,
  onRouteViewModeChange,
  onThemeChange,
  onOpenDebug,
}: SettingsPageProps) {
  const { locale, setLocale, messages } = useI18n();
  const routeViewOptions: RouteViewMode[] = ['default', 'comfortable', 'compact'];
  const routeDensityOptions = routeViewOptions.map((mode): SelectOption<RouteViewMode> => ({
    value: mode,
    label: getRouteViewLabel(mode, messages),
    icon: <RouteDensityPreview mode={mode} />,
  }));
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
        <div>
          <label htmlFor="locale-select">{messages.pages.settings.localeLabel}</label>
          <div className="small-text">{messages.pages.settings.localeSubtitle}</div>
        </div>
        <SettingsSelect
          id="locale-select"
          value={locale}
          options={localeOptions}
          onChange={setLocale}
        />
      </div>

      <div className="field field-compact">
        <div>
          <label htmlFor="theme-select">{messages.pages.settings.themeLabel}</label>
          <div className="small-text">{messages.pages.settings.themeSubtitle}</div>
        </div>
        <SettingsSelect id="theme-select" value={themeMode} options={themeOptions} onChange={onThemeChange} />
      </div>

      <div className="field field-compact">
        <div>
          <label htmlFor="route-density-select">{messages.pages.settings.routeDensityLabel}</label>
          <div className="small-text">{messages.pages.settings.routeDensitySubtitle}</div>
        </div>
        <SettingsSelect
          id="route-density-select"
          value={routeViewMode}
          options={routeDensityOptions}
          onChange={onRouteViewModeChange}
        />
      </div>

      <DebugLink onOpen={onOpenDebug} />
      <div className="settings-footnote small-text">{messages.labels.storedLocally}</div>
    </Card>
  );
}
