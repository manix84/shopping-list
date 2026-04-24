import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryCode, ThemeMode } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { type LocaleCode, useI18n } from '../lib/i18n';

type SettingsPageProps = {
  countryCode: CountryCode;
  themeMode: ThemeMode;
  onCountryChange: (countryCode: CountryCode) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onOpenDebug: () => void;
};

export function SettingsPage({ countryCode, themeMode, onCountryChange, onThemeChange, onOpenDebug }: SettingsPageProps) {
  const { locale, setLocale, messages } = useI18n();

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
        <label htmlFor="country-select">{messages.pages.settings.countryLabel}</label>
        <select
          id="country-select"
          className="select"
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value as CountryCode)}
        >
          {Object.values(COUNTRY_CONFIGS)
            .slice()
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
        </select>
      </div>

      <div className="field field-compact">
        <label htmlFor="theme-select">{messages.pages.settings.themeLabel}</label>
        <select
          id="theme-select"
          className="select"
          value={themeMode}
          onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
        >
          <option value="system">{messages.themeOptions.system}</option>
          <option value="light">{messages.themeOptions.light}</option>
          <option value="dark">{messages.themeOptions.dark}</option>
        </select>
        <div className="small-text">{messages.labels.storedLocally}</div>
      </div>

      <div className="field field-compact">
        <label htmlFor="locale-select">{messages.pages.settings.localeLabel}</label>
        <select
          id="locale-select"
          className="select"
          value={locale}
          onChange={(event) => setLocale(event.target.value as LocaleCode)}
        >
          {Object.entries(messages.localeOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <DebugLink onOpen={onOpenDebug} />
    </Card>
  );
}
