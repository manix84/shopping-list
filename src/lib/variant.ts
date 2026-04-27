import type { CountryConfig } from '../types';
import { cleanEntryName, cleanLine, normalize } from './stringUtils';
import { flattenSections } from './sections';

type ExtractedVariant = {
  name: string;
  variant?: string;
};

type VariantRule = {
  base: string;
  variants: string[];
  middleSuffix?: string;
};

const VARIANTABLE_BASE_KEYWORDS = new Set(['cream', 'ice cream', 'milk', 'yogurt', 'yoghurt']);
const VARIANT_EXTRACTION_EXCLUSIONS = new Set(['whipped cream']);
const DEFAULT_VARIANTS = new Map<string, ExtractedVariant>([
  ['milk', { name: 'milk', variant: 'semi skimmed' }],
  ['blue milk', { name: 'milk', variant: 'whole' }],
  ['gold milk', { name: 'milk', variant: 'semi skimmed' }],
  ['green milk', { name: 'milk', variant: 'semi skimmed' }],
  ['red milk', { name: 'milk', variant: 'skimmed' }],
]);
const DRINK_VARIANT_RULES: VariantRule[] = [
  {
    base: 'pepsi max',
    variants: ['cherry', 'lime', 'mango', 'tropical', 'lemon'],
  },
  {
    base: 'pepsi zero',
    variants: ['cherry', 'lime', 'mango', 'tropical', 'lemon'],
  },
  {
    base: 'pepsi',
    variants: ['cherry', 'lime', 'mango', 'tropical', 'lemon'],
  },
  {
    base: 'coke zero',
    variants: ['cherry', 'lime', 'mango', 'tropical', 'lemon'],
  },
  {
    base: 'coke',
    variants: ['cherry', 'lime', 'mango', 'tropical', 'lemon'],
  },
  {
    base: 'kopparberg cider',
    variants: [
      'strawberry lime',
      'strawberry and lime',
      'mixed fruit',
      'mixed fruit tropical',
      'pear',
      'strawberry pineapple',
      'strawberry and pineapple',
      'mango',
      'raspberry',
      'cherry',
      'blueberry lime',
      'blueberry and lime',
      'rhubarb',
      'sweet vintage apple',
      'spiced apple',
      'winter punch',
    ],
    middleSuffix: 'cider',
  },
  {
    base: 'kopparberg alcohol free',
    variants: ['strawberry lime', 'strawberry and lime', 'mixed fruit', 'pear'],
  },
  {
    base: 'kopparberg gin',
    variants: ['strawberry lime', 'strawberry and lime', 'passionfruit orange', 'passionfruit and orange'],
    middleSuffix: 'gin',
  },
  {
    base: 'kopparberg vodka',
    variants: ['strawberry lime', 'strawberry and lime', 'lemon'],
    middleSuffix: 'vodka',
  },
  {
    base: 'kopparberg gin lemonade',
    variants: ['strawberry lime', 'strawberry and lime'],
  },
  {
    base: 'rekorderlig cider',
    variants: [
      'strawberry lime',
      'strawberry and lime',
      'wild berries',
      'mango raspberry',
      'mango and raspberry',
      'passionfruit',
      'peach raspberry',
      'peach and raspberry',
      'pineapple kiwi',
      'pineapple and kiwi',
      'blood orange',
      'pink lemon',
      'watermelon citrus',
      'watermelon and citrus',
      'blackberry blackcurrant',
      'blackberry and blackcurrant',
      'pear apple',
      'pear and apple',
    ],
    middleSuffix: 'cider',
  },
  {
    base: 'jack daniels',
    variants: ['honey', 'fire', 'apple'],
  },
];

const keywordCandidates = (config: CountryConfig | undefined): string[] =>
  Array.from(
    new Set(
      flattenSections(config)
        .flatMap((section) => section.keywords)
        .map((keyword) => normalize(keyword))
        .filter(Boolean),
    ),
  ).sort((a, b) => b.length - a.length);

const findVariantableSuffix = (normalizedName: string, candidates: string[]): string | undefined => {
  if (VARIANT_EXTRACTION_EXCLUSIONS.has(normalizedName)) return undefined;

  return candidates
    .filter((keyword) => keyword !== normalizedName && VARIANTABLE_BASE_KEYWORDS.has(keyword))
    .find((keyword) => normalizedName.endsWith(` ${keyword}`));
};

const extractByRule = (normalizedName: string): ExtractedVariant | undefined => {
  for (const rule of DRINK_VARIANT_RULES) {
    if (normalizedName === rule.base) continue;

    for (const variant of rule.variants) {
      if (normalizedName === `${variant} ${rule.base}` || normalizedName === `${rule.base} ${variant}`) {
        return { name: rule.base, variant };
      }

      if (rule.middleSuffix) {
        const brand = rule.base.slice(0, -rule.middleSuffix.length).trim();
        if (brand && normalizedName === `${brand} ${variant} ${rule.middleSuffix}`) {
          return { name: rule.base, variant };
        }
        if (brand && normalizedName === `${brand} ${variant}`) {
          return { name: rule.base, variant };
        }
      }
    }
  }

  return undefined;
};

export const extractVariant = (value: unknown, config: CountryConfig | undefined): ExtractedVariant => {
  const trimmed = cleanLine(value);
  const normalizedName = normalize(trimmed);
  if (!normalizedName) return { name: trimmed };

  const candidates = keywordCandidates(config);
  const ruleMatch = extractByRule(normalizedName);
  if (ruleMatch) return ruleMatch;

  const defaultVariant = DEFAULT_VARIANTS.get(normalizedName);
  if (defaultVariant) {
    return defaultVariant;
  }

  const variantableMatch = findVariantableSuffix(normalizedName, candidates);
  if (variantableMatch) {
    const variant = normalizedName.slice(0, -variantableMatch.length).trim();
    if (variant && cleanEntryName(variant) !== cleanEntryName(variantableMatch)) {
      return {
        name: variantableMatch,
        variant,
      };
    }
  }

  if (candidates.includes(normalizedName)) {
    return { name: trimmed };
  }

  const match = candidates.find((keyword) => normalizedName.endsWith(` ${keyword}`));
  if (!match) return { name: trimmed };

  const variant = normalizedName.slice(0, -match.length).trim();
  if (!variant || cleanEntryName(variant) === cleanEntryName(match)) {
    return { name: trimmed };
  }

  return {
    name: match,
    variant,
  };
};
