import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryCode, ThemeMode } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { getThemeLabel } from '../lib/themePreference';

type SettingsPageProps = {
  countryCode: CountryCode;
  themeMode: ThemeMode;
  onCountryChange: (countryCode: CountryCode) => void;
  onThemeChange: (themeMode: ThemeMode) => void;
  onOpenDebug: () => void;
};

export function SettingsPage({ countryCode, themeMode, onCountryChange, onThemeChange, onOpenDebug }: SettingsPageProps) {
  return (
    <Card
      header={
        <>
          <h2 className="title title-md">Settings</h2>
          <p className="subtitle">Preferences that affect how this device displays and groups shopping lists.</p>
        </>
      }
      bodyClassName="stack"
    >
      <div className="field field-compact">
        <label htmlFor="country-select">Country profile</label>
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
        <label htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          className="select"
          value={themeMode}
          onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
        >
          <option value="system">{getThemeLabel('system')}</option>
          <option value="light">{getThemeLabel('light')}</option>
          <option value="dark">{getThemeLabel('dark')}</option>
        </select>
        <div className="small-text">Stored locally on this device only.</div>
      </div>

      <DebugLink onOpen={onOpenDebug} />
    </Card>
  );
}
