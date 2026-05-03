export const ensureString = (value: unknown): string => (typeof value === 'string' ? value : '');

export const cleanLine = (line: unknown): string =>
  ensureString(line)
    .trim()
    .replace(/^[-*•\s]+/, '')
    .replace(/\s+/g, ' ');

export const normalize = (value: unknown): string =>
  ensureString(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[-_/]+/g, ' ')
    .replace(/[()'.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const spellingAliases = new Map<string, string>([
  ['avacado', 'avocado'],
  ['bannana', 'banana'],
  ['bananna', 'banana'],
  ['brocoli', 'broccoli'],
  ['brocolli', 'broccoli'],
  ['chease', 'cheese'],
  ['cheeze', 'cheese'],
  ['cheedar', 'cheddar'],
  ['choclate', 'chocolate'],
  ['cinamon', 'cinnamon'],
  ['cocacola', 'coca cola'],
  ['cocnut', 'coconut'],
  ['courget', 'courgette'],
  ['cucumberr', 'cucumber'],
  ['detergant', 'detergent'],
  ['fettucine', 'fettuccine'],
  ['fettucini', 'fettuccine'],
  ['fetuccine', 'fettuccine'],
  ['garlick', 'garlic'],
  ['ibuprophen', 'ibuprofen'],
  ['ketchup chip', 'ketchup chips'],
  ['kopperberg', 'kopparberg'],
  ['linguini', 'linguine'],
  ['mozarella', 'mozzarella'],
  ['paracetemol', 'paracetamol'],
  ['parmezan', 'parmesan'],
  ['pinapple', 'pineapple'],
  ['potatos', 'potatoes'],
  ['rasberry', 'raspberry'],
  ['spagetti', 'spaghetti'],
  ['strawbery', 'strawberry'],
  ['tomatos', 'tomatoes'],
  ['yoghert', 'yoghurt'],
  ['yogourt', 'yogurt'],
  ['yougurt', 'yogurt'],
]);

export const correctSpelling = (value: unknown): string => {
  const normalizedValue = normalize(value);
  if (!normalizedValue) { return ''; }

  return normalizedValue
    .split(' ')
    .map((word) => spellingAliases.get(word) ?? word)
    .join(' ');
};

const singularizeWord = (word: string): string => {
  if (word.length <= 3) { return word; }
  if (word === 'cheeses') { return 'cheese'; }
  if (word === 'potatoes') { return 'potato'; }
  if (word === 'tomatoes') { return 'tomato'; }
  if (word.endsWith('ies')) { return `${word.slice(0, -3)}y`; }
  if (word.endsWith('ves')) { return `${word.slice(0, -3)}f`; }
  if (/(?:ches|shes|xes|zes|ses)$/.test(word)) { return word.slice(0, -2); }
  if (word.endsWith('s') && !/(?:ss|us|is)$/.test(word)) { return word.slice(0, -1); }
  return word;
};

const neverPluralize = new Set([
  'bread',
  'butter',
  'cheese',
  'cream',
  'fish',
  'flour',
  'fruit',
  'juice',
  'meat',
  'milk',
  'oil',
  'pasta',
  'rice',
  'salad',
  'water',
]);

const pluralizeWord = (word: string): string => {
  if (word.length <= 2 || neverPluralize.has(word)) { return word; }
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) { return `${word.slice(0, -1)}ies`; }
  if (word.endsWith('fe')) { return `${word.slice(0, -2)}ves`; }
  if (word.endsWith('f')) { return `${word.slice(0, -1)}ves`; }
  if (/(?:s|sh|ch|x|z)$/.test(word)) { return `${word}es`; }
  if (word.endsWith('o') && !/[aeiou]o$/.test(word)) { return `${word}es`; }
  return `${word}s`;
};

const displayNameAliases = new Map<string, string>([
  ['blue milk', 'whole milk'],
  ['gold milk', 'semi-skimmed milk'],
  ['green milk', 'semi-skimmed milk'],
  ['milk', 'semi-skimmed milk'],
  ['red milk', 'skimmed milk'],
]);

const lowercaseTrailingToken = (value: string): string => {
  const tokens = value.split(' ');
  const lastIndex = tokens.length - 1;
  if (lastIndex < 0) { return value; }

  tokens[lastIndex] = tokens[lastIndex]
    .split('-')
    .map((segment, segmentIndex, segments) => {
      if (segmentIndex !== segments.length - 1) { return segment; }
      const singular = singularizeWord(segment.toLowerCase());
      return pluralizeWord(singular);
    })
    .join('-');

  return tokens.join(' ');
};

const titleCaseWord = (word: string, index: number, words: string[]): string => {
  if (!word) { return word; }

  const lower = word.toLowerCase();
  if (word.includes('-')) {
    return word
      .split('-')
      .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}` : part))
      .join('-');
  }

  const smallWord = new Set(['and', 'or', 'the', 'of', 'to', 'a', 'an', 'in', 'on', 'at', 'by', 'for', 'from', 'with']);
  if (index !== 0 && index !== words.length - 1 && smallWord.has(lower)) {
    return lower;
  }

  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
};

export const formatDisplayName = (value: unknown, quantityValue?: number): string => {
  const normalized = ensureString(value).trim().replace(/\s+/g, ' ').toLowerCase();
  if (!normalized) { return ''; }

  const aliased = displayNameAliases.get(normalized) ?? normalized;
  const pluralized = typeof quantityValue === 'number' && quantityValue !== 1 ? lowercaseTrailingToken(aliased) : aliased;
  const words = pluralized.split(' ');
  const base = words.map((word, index) => titleCaseWord(word, index, words)).join(' ');
  return base;
};

export const removeLeadingDescriptors = (value: unknown): string =>
  correctSpelling(value)
    .replace(/^(fresh|large|small|medium|organic|british|free range|free-range|extra large|extra-large)\s+/i, '')
    .trim();

export const unwrapContainerName = (value: unknown): string =>
  ensureString(value)
    .trim()
    .replace(
      /^(?:bag|bags|pack|packs|packet|packets|box|boxes|pouch|pouches|sack|sacks|tray|trays|tub|tubs)\s+of\s+/i,
      '',
    )
    .trim();

export const cleanEntryName = (value: unknown): string =>
  unwrapContainerName(removeLeadingDescriptors(value))
    .split(' ')
    .filter(Boolean)
    .map(singularizeWord)
    .join(' ')
    .trim();

export const stripDisplaySizeLabel = (value: unknown): string =>
  ensureString(value).replace(/\s*\(size:\s*[SML]\)\s*$/i, '').trim();

export const pluralizeEntryName = (value: unknown): string =>
  normalize(value)
    .split(' ')
    .filter(Boolean)
    .map((word, index, words) => (index === words.length - 1 ? pluralizeWord(word) : word))
    .join(' ')
    .trim();

export const escapeRegExp = (value: unknown): string => ensureString(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
