import type { CountryConfig, SectionKey } from '../types';
import { cleanLine } from './stringUtils';

export type ProductSuggestion = {
  value: string;
  sectionKey: SectionKey;
  sectionLabel: string;
};

const MAX_PRODUCT_SUGGESTIONS = 8;

const suggestionMatchKey = (value: string): string => cleanLine(value)
  .toLocaleLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export const buildProductSuggestions = (config: CountryConfig): ProductSuggestion[] => {
  const seen = new Set<string>();
  const suggestions: ProductSuggestion[] = [];

  for (const group of config.groups) {
    for (const section of group.sections) {
      for (const keyword of section.keywords) {
        const value = cleanLine(keyword);
        const key = suggestionMatchKey(value);
        if (!value || seen.has(key)) {
          continue;
        }

        seen.add(key);
        suggestions.push({
          value,
          sectionKey: section.key,
          sectionLabel: section.label,
        });
      }
    }
  }

  return suggestions;
};

export const filterProductSuggestions = (
  suggestions: ProductSuggestion[],
  query: string,
  limit = MAX_PRODUCT_SUGGESTIONS,
): ProductSuggestion[] => {
  const normalizedQuery = suggestionMatchKey(query);
  if (normalizedQuery.length < 2) { return []; }

  const startsWithMatches: ProductSuggestion[] = [];
  const includesMatches: ProductSuggestion[] = [];

  for (const suggestion of suggestions) {
    const value = suggestionMatchKey(suggestion.value);
    if (value === normalizedQuery) {
      continue;
    }

    if (value.startsWith(normalizedQuery)) {
      startsWithMatches.push(suggestion);
      continue;
    }

    if (value.includes(normalizedQuery)) {
      includesMatches.push(suggestion);
    }
  }

  return [...startsWithMatches, ...includesMatches].slice(0, limit);
};
