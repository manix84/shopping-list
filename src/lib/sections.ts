import type { CountryConfig, SectionDef, SectionKey } from '../types';
import { cleanEntryName, escapeRegExp, normalize } from './stringUtils';

export const flattenSections = (config: CountryConfig | undefined): Array<SectionDef & { groupLabel: string; order: number }> => {
  if (!config) { return []; }

  return config.groups.flatMap((group) =>
    group.sections.map((section) => ({
      ...section,
      keywords: Array.isArray(section.keywords)
        ? section.keywords.filter((keyword): keyword is string => typeof keyword === 'string')
        : [],
      groupLabel: group.label,
      order: group.order,
    })),
  );
};

export const buildKeywordPattern = (keyword: unknown): RegExp => {
  const safeKeyword = escapeRegExp(normalize(cleanEntryName(keyword)));
  if (!safeKeyword) {
    return /^$/i;
  }
  return new RegExp(`(^|\\s)${safeKeyword}(\\s|$)`, 'i');
};

export const detectSection = (name: unknown, config: CountryConfig | undefined): SectionKey => {
  const cleaned = normalize(cleanEntryName(name));
  if (!cleaned) { return 'other'; }

  const sections = flattenSections(config);
  let bestMatch: { section: SectionKey; keywordLength: number; groupOrder: number } | null = null;

  for (const section of sections) {
    for (const keyword of section.keywords) {
      const cleanedKeyword = normalize(cleanEntryName(keyword));
      if (!cleanedKeyword) { continue; }

      const pattern = buildKeywordPattern(cleanedKeyword);
      if (!pattern.test(cleaned)) { continue; }

      const candidate = {
        section: section.key,
        keywordLength: cleanedKeyword.length,
        groupOrder: section.order,
      };

      if (
        !bestMatch ||
        candidate.keywordLength > bestMatch.keywordLength ||
        (candidate.keywordLength === bestMatch.keywordLength && candidate.groupOrder < bestMatch.groupOrder)
      ) {
        bestMatch = candidate;
      }
    }
  }

  return bestMatch?.section ?? 'other';
};

export const getSectionMeta = (config: CountryConfig, key: SectionKey): { label: string; groupLabel: string; order: number } => {
  const section = flattenSections(config).find((entry) => entry.key === key);
  return {
    label: section?.label ?? 'Other',
    groupLabel: section?.groupLabel ?? 'Other',
    order: section?.order ?? 999,
  };
};
