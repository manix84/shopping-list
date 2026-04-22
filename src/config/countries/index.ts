import type { CountryCode, CountryConfig } from '../../types';
import { CA_CONFIG } from './ca';
import { UK_CONFIG } from './uk';
import { US_CONFIG } from './us';

export const COUNTRY_CONFIGS: Record<CountryCode, CountryConfig> = {
  ca: CA_CONFIG,
  uk: UK_CONFIG,
  us: US_CONFIG,
};

export const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === 'string' && value in COUNTRY_CONFIGS;
