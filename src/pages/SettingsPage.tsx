import { COUNTRY_CONFIGS } from '../config/countries';
import type { CountryCode, CountryConfig } from '../types';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { Badge } from '../components/Badge';

type SettingsPageProps = {
  countryCode: CountryCode;
  config: CountryConfig;
  onCountryChange: (countryCode: CountryCode) => void;
  onOpenDebug: () => void;
};

export function SettingsPage({ countryCode, config, onCountryChange, onOpenDebug }: SettingsPageProps) {
  return (
    <Card
      header={
        <>
          <h2 className="title title-md">Settings</h2>
          <p className="subtitle">Country configs are explicit, so store grouping can vary by region later.</p>
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
          {Object.values(COUNTRY_CONFIGS).map((country) => (
            <option key={country.code} value={country.code}>{country.label}</option>
          ))}
        </select>
      </div>

      <DebugLink onOpen={onOpenDebug} />

      <div className="stack">
        {config.groups.map((group) => (
          <div key={group.key} className="section-card">
            <div className="section-heading section-spacing">
              <div className="section-group">Order {group.order}</div>
              <h3 className="section-title">{group.label}</h3>
            </div>
            <div className="badge-row">
              {group.sections.map((section) => (
                <Badge key={section.key}>{section.label}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
