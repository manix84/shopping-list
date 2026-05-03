import { useMemo } from 'react';
import { mdiChevronDown } from '@mdi/js';
import { COUNTRY_CONFIGS } from '../config/countries';
import { useI18n } from '../lib/i18n';
import type { CountryCode } from '../types';

type CountrySelectProps = {
  id: string;
  value: CountryCode;
  onChange: (countryCode: CountryCode) => void;
};

export function CountrySelect({ id, value, onChange }: CountrySelectProps) {
  const { messages } = useI18n();
  const countryOptions = useMemo(
    () =>
      Object.values(COUNTRY_CONFIGS)
        .slice()
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  return (
    <div className={'select-shell'}>
      <select
        id={id}
        className={'select select-with-icon'}
        value={value}
        aria-label={messages.labels.countryProfile}
        onChange={(event) => onChange(event.target.value as CountryCode)}
      >
        {countryOptions.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.label}
          </option>
        ))}
      </select>
      <svg aria-hidden={'true'} className={'select-chevron-svg'} viewBox={'0 0 24 24'}>
        <path d={mdiChevronDown} fill={'currentColor'} />
      </svg>
    </div>
  );
}
