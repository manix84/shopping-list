import type { CountryCode, CountryConfig } from '../../types';
import { CA_CONFIG } from './ca';
import {
  BE_CONFIG,
  DE_CONFIG,
  ES_CONFIG,
  FR_CONFIG,
  IT_CONFIG,
  MX_CONFIG,
  NL_CONFIG,
  RO_CONFIG,
} from './international';
import { UK_CONFIG } from './uk';
import { US_CONFIG } from './us';

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  be: BE_CONFIG,
  ca: CA_CONFIG,
  de: DE_CONFIG,
  es: ES_CONFIG,
  fr: FR_CONFIG,
  it: IT_CONFIG,
  mx: MX_CONFIG,
  nl: NL_CONFIG,
  ro: RO_CONFIG,
  uk: UK_CONFIG,
  us: US_CONFIG,
};

export const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === 'string' && value in COUNTRY_CONFIGS;
