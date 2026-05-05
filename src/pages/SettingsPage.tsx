import { mdiChevronDown, mdiDownload } from '@mdi/js';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryCode, RouteViewMode, SaveStatus, ThemeMode } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { SaveStatusIndicator } from '../components/SaveStatusIndicator';
import {
  AUTO_DETECT_COUNTRY,
  type DefaultCountryPreference,
  inferDefaultCountryCode,
  loadDefaultCountryPreference,
  saveDefaultCountryPreference,
} from '../lib/defaultCountryPreference';
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
  canPromptInstall: boolean;
  canShowManualInstallGuidance: boolean;
  isInstalled: boolean;
  isFloatingInstallVisible: boolean;
  onInstall: () => void;
};

type ThemeIconProps = {
  mode: ThemeMode;
};

function ThemeIcon({ mode }: ThemeIconProps) {
  return <span aria-hidden={'true'} className={`theme-option-icon theme-option-icon-${mode}`} />;
}

function LocaleIcon({ locale }: { locale: LocaleCode }) {
  return (
    <span aria-hidden={'true'} className={'locale-option-icon'}>
      {locale.toUpperCase()}
    </span>
  );
}

function CountryIcon({ countryCode }: { countryCode: CountryCode }) {
  return (
    <span aria-hidden={'true'} className={'country-option-icon'}>
      {COUNTRY_CONFIGS[countryCode].flag}
    </span>
  );
}

function AutoDetectCountryIcon() {
  return <span aria-hidden={'true'} className={'country-option-icon country-option-icon-auto'} />;
}

function RouteDensityPreview({ mode }: { mode: RouteViewMode }) {
  return (
    <span aria-hidden={'true'} className={`route-density-preview route-density-preview-${mode}`}>
      <span className={'route-density-preview-shell'}>
        <span className={'route-density-preview-row'}>
          <span className={'route-density-preview-dot'} />
          <span className={'route-density-preview-line route-density-preview-line-title'} />
        </span>
        <span className={'route-density-preview-row'}>
          <span className={'route-density-preview-dot'} />
          <span className={'route-density-preview-line'} />
        </span>
        <span className={'route-density-preview-row'}>
          <span className={'route-density-preview-dot'} />
          <span className={'route-density-preview-line route-density-preview-line-short'} />
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
      className={'settings-select'}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type={'button'}
        className={'select settings-select-button'}
        aria-haspopup={'listbox'}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      >
        <span className={'settings-option-content'}>
          {selectedOption.icon ? <span className={'settings-option-icon-slot'}>{selectedOption.icon}</span> : null}
          <span>{selectedOption.label}</span>
        </span>
        <svg aria-hidden={'true'} className={'settings-select-chevron-svg'} viewBox={'0 0 24 24'}>
          <path d={mdiChevronDown} fill={'currentColor'} />
        </svg>
      </button>

      {open ? (
        <div id={menuId} className={'settings-select-menu'} role={'listbox'} aria-labelledby={id}>
          {options.map((option) => (
            <button
              key={option.value}
              type={'button'}
              role={'option'}
              aria-selected={value === option.value}
              className={`settings-select-option ${value === option.value ? 'settings-select-option-active' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className={'settings-option-content'}>
                {option.icon ? <span className={'settings-option-icon-slot'}>{option.icon}</span> : null}
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
  canPromptInstall,
  canShowManualInstallGuidance,
  isInstalled,
  isFloatingInstallVisible,
  onInstall,
}: SettingsPageProps) {
  const { locale, setLocale, messages } = useI18n();
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<SaveStatus>('idle');
  const [detectedCountryCode] = useState<CountryCode>(() => inferDefaultCountryCode());
  const [defaultCountryPreference, setDefaultCountryPreference] = useState<DefaultCountryPreference>(
    () => loadDefaultCountryPreference() ?? AUTO_DETECT_COUNTRY,
  );
  const settingsSaveTimerRef = useRef<number>();
  const routeViewOptions: RouteViewMode[] = ['default', 'comfortable', 'compact'];
  const countryLabel = (countryCode: CountryCode) =>
    messages.countryOptions[countryCode] ?? COUNTRY_CONFIGS[countryCode].label;
  const defaultCountryOptions: SelectOption<DefaultCountryPreference>[] = [
    {
      value: AUTO_DETECT_COUNTRY,
      label: messages.pages.settings.defaultCountryAutoDetect,
      icon: <AutoDetectCountryIcon />,
    },
    ...Object.values(COUNTRY_CONFIGS)
      .slice()
      .sort((a, b) => countryLabel(a.code).localeCompare(countryLabel(b.code), locale))
      .map((country): SelectOption<DefaultCountryPreference> => ({
        value: country.code,
        label: country.code === detectedCountryCode
          ? `${countryLabel(country.code)} (${messages.pages.settings.detectedCountrySuffix})`
          : countryLabel(country.code),
        icon: <CountryIcon countryCode={country.code} />,
      })),
  ];
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
  const shouldShowInstallSetting =
    !isFloatingInstallVisible &&
    !isInstalled &&
    (canPromptInstall || canShowManualInstallGuidance);
  const installTitle = canPromptInstall ? messages.pwaInstall.settingsTitle : messages.pwaInstall.unavailableTitle;
  const installDescription = canPromptInstall
    ? messages.pwaInstall.settingsDescription
    : messages.pwaInstall.unavailableDescription;

  const installSetting = shouldShowInstallSetting ? (
    <div className={'settings-install-row'}>
      <div className={'settings-install-icon'} aria-hidden={'true'}>
        <svg viewBox={'0 0 24 24'}>
          <path d={mdiDownload} fill={'currentColor'} />
        </svg>
      </div>
      <div className={'settings-install-copy'}>
        <h3>{installTitle}</h3>
        <p>{installDescription}</p>
      </div>
      {canPromptInstall && !isInstalled ? (
        <button type={'button'} className={'button button-primary'} onClick={onInstall}>
          {messages.pwaInstall.installAction}
        </button>
      ) : null}
    </div>
  ) : null;
  const writeSetting = (apply: () => void, write?: () => void) => {
    if (settingsSaveTimerRef.current) {
      window.clearTimeout(settingsSaveTimerRef.current);
    }

    setSettingsSaveStatus('saving');
    apply();

    try {
      write?.();
      settingsSaveTimerRef.current = window.setTimeout(() => {
        setSettingsSaveStatus('saved');
      }, 120);
    } catch (error) {
      console.warn('Unable to save settings preference.', error);
      setSettingsSaveStatus('error');
    }
  };
  const handleLocaleChange = (nextLocale: LocaleCode) => {
    writeSetting(() => setLocale(nextLocale));
  };
  const handleDefaultCountryChange = (preference: DefaultCountryPreference) => {
    writeSetting(
      () => setDefaultCountryPreference(preference),
      () => saveDefaultCountryPreference(preference),
    );
  };
  const handleThemeChange = (nextThemeMode: ThemeMode) => {
    writeSetting(() => onThemeChange(nextThemeMode));
  };
  const handleRouteViewModeChange = (nextRouteViewMode: RouteViewMode) => {
    writeSetting(() => onRouteViewModeChange(nextRouteViewMode));
  };

  useEffect(() => () => {
    if (settingsSaveTimerRef.current) {
      window.clearTimeout(settingsSaveTimerRef.current);
    }
  }, []);

  return (
    <>
      <Card
        header={
          <>
            <div className={'page-title-with-status'}>
              <h2 className={'title title-md'}>{messages.pages.settings.title}</h2>
              <SaveStatusIndicator status={settingsSaveStatus} />
            </div>
            <p className={'subtitle'}>{messages.pages.settings.subtitle}</p>
          </>
        }
        bodyClassName={'stack'}
      >
        <div className={'field field-compact'}>
          <div>
            <label htmlFor={'locale-select'}>{messages.pages.settings.localeLabel}</label>
            <div className={'small-text'}>{messages.pages.settings.localeSubtitle}</div>
          </div>
          <SettingsSelect
            id={'locale-select'}
            value={locale}
            options={localeOptions}
            onChange={handleLocaleChange}
          />
        </div>

        <div className={'field field-compact'}>
          <div>
            <label htmlFor={'default-country-select'}>{messages.pages.settings.defaultCountryLabel}</label>
            <div className={'small-text'}>{messages.pages.settings.defaultCountrySubtitle}</div>
          </div>
          <SettingsSelect
            id={'default-country-select'}
            value={defaultCountryPreference}
            options={defaultCountryOptions}
            onChange={handleDefaultCountryChange}
          />
        </div>

        <div className={'field field-compact'}>
          <div>
            <label htmlFor={'theme-select'}>{messages.pages.settings.themeLabel}</label>
            <div className={'small-text'}>{messages.pages.settings.themeSubtitle}</div>
          </div>
          <SettingsSelect id={'theme-select'} value={themeMode} options={themeOptions} onChange={handleThemeChange} />
        </div>

        <div className={'field field-compact'}>
          <div>
            <label htmlFor={'route-density-select'}>{messages.pages.settings.routeDensityLabel}</label>
            <div className={'small-text'}>{messages.pages.settings.routeDensitySubtitle}</div>
          </div>
          <SettingsSelect
            id={'route-density-select'}
            value={routeViewMode}
            options={routeDensityOptions}
            onChange={handleRouteViewModeChange}
          />
        </div>

        <DebugLink onOpen={onOpenDebug} />
        <div className={'settings-footnote small-text'}>{messages.labels.storedLocally}</div>
      </Card>
      {installSetting}
    </>
  );
}
