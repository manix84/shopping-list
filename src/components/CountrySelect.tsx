import { mdiChevronDown } from '@mdi/js';
import { useMemo, useState } from 'react';
import { COUNTRY_CONFIGS } from '../config/countries';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import type { CountryCode } from '../types';
import st from './SettingsSelect.module.scss';

type CountrySelectProps = {
  id: string;
  value: CountryCode;
  onChange: (countryCode: CountryCode) => void;
};

export function CountrySelect({ id, value, onChange }: CountrySelectProps) {
  const { locale, messages } = useI18n();
  const [open, setOpen] = useState(false);
  const countryOptions = useMemo(
    () =>
      Object.values(COUNTRY_CONFIGS)
        .slice()
        .sort((a, b) =>
          (messages.countryOptions[a.code] ?? a.label).localeCompare(
            messages.countryOptions[b.code] ?? b.label,
            locale,
          ),
        ),
    [locale, messages.countryOptions],
  );
  const selectedCountry = COUNTRY_CONFIGS[value];
  const selectedCountryLabel = messages.countryOptions[value] ?? selectedCountry.label;
  const menuId = `${id}-menu`;

  return (
    <div
      className={classNames(st.root, st.settingsSelect, st.countrySelect)}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        id={id}
        type={'button'}
        className={classNames('select', st.button, st.settingsSelectButton)}
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
        <span className={classNames(st.optionContent, st.settingsOptionContent)}>
          <span className={classNames(st.optionIconSlot, st.settingsOptionIconSlot)}>
            <span aria-hidden={'true'} className={classNames(st.countryIcon, st.countryOptionIcon)}>{selectedCountry.flag}</span>
          </span>
          <span>{selectedCountryLabel}</span>
        </span>
        <svg aria-hidden={'true'} className={classNames(st.chevron, st.settingsSelectChevronSvg)} viewBox={'0 0 24 24'}>
          <path d={mdiChevronDown} fill={'currentColor'} />
        </svg>
      </button>

      {open ? (
        <div id={menuId} className={classNames(st.menu, st.settingsSelectMenu)} role={'listbox'} aria-labelledby={id}>
          {countryOptions.map((country) => {
            const countryLabel = messages.countryOptions[country.code] ?? country.label;

            return (
              <button
                key={country.code}
                type={'button'}
                role={'option'}
                aria-selected={value === country.code}
                className={classNames(
                  st.option,
                  st.settingsSelectOption,
                  value === country.code ? st.active : undefined,
                  value === country.code ? st.settingsSelectOptionActive : undefined,
                )}
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                }}
              >
                <span className={classNames(st.optionContent, st.settingsOptionContent)}>
                  <span className={classNames(st.optionIconSlot, st.settingsOptionIconSlot)}>
                    <span aria-hidden={'true'} className={classNames(st.countryIcon, st.countryOptionIcon)}>{country.flag}</span>
                  </span>
                  <span>{countryLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
