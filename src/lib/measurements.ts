import type { CountryConfig, MeasurementDisplayMode, MeasurementUnitSystem } from '../types';
import { cleanLine } from './stringUtils';

export type MetricMeasurementUnit = 'g' | 'ml';

export type ExtractedMeasurement = {
  name: string;
  quantity?: string;
  quantityDisplay?: string;
  quantityMetricValue?: number;
  quantityMetricUnit?: MetricMeasurementUnit;
};

type UnitDefinition = {
  aliases: string[];
  metricUnit: MetricMeasurementUnit;
  metricFactor: Record<MeasurementUnitSystem, number>;
  displayUnit: string;
};

const UNIT_DEFINITIONS: UnitDefinition[] = [
  {
    aliases: ['g', 'gram', 'grams'],
    metricUnit: 'g',
    metricFactor: { metric: 1, 'us-customary': 1, 'canadian-customary': 1 },
    displayUnit: 'g',
  },
  {
    aliases: ['kg', 'kilogram', 'kilograms'],
    metricUnit: 'g',
    metricFactor: { metric: 1000, 'us-customary': 1000, 'canadian-customary': 1000 },
    displayUnit: 'kg',
  },
  {
    aliases: ['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters'],
    metricUnit: 'ml',
    metricFactor: { metric: 1, 'us-customary': 1, 'canadian-customary': 1 },
    displayUnit: 'ml',
  },
  {
    aliases: ['l', 'litre', 'litres', 'liter', 'liters'],
    metricUnit: 'ml',
    metricFactor: { metric: 1000, 'us-customary': 1000, 'canadian-customary': 1000 },
    displayUnit: 'l',
  },
  {
    aliases: ['tsp', 'tsps', 'teaspoon', 'teaspoons'],
    metricUnit: 'ml',
    metricFactor: { metric: 5, 'us-customary': 4.92892159375, 'canadian-customary': 5 },
    displayUnit: 'tsp',
  },
  {
    aliases: ['tbsp', 'tbsps', 'tablespoon', 'tablespoons'],
    metricUnit: 'ml',
    metricFactor: { metric: 15, 'us-customary': 14.78676478125, 'canadian-customary': 15 },
    displayUnit: 'tbsp',
  },
  {
    aliases: ['cup', 'cups'],
    metricUnit: 'ml',
    metricFactor: { metric: 250, 'us-customary': 236.5882365, 'canadian-customary': 250 },
    displayUnit: 'cup',
  },
  {
    aliases: ['fl oz', 'fluid ounce', 'fluid ounces'],
    metricUnit: 'ml',
    metricFactor: { metric: 28.4130625, 'us-customary': 29.5735295625, 'canadian-customary': 28.4130625 },
    displayUnit: 'fl oz',
  },
  {
    aliases: ['oz', 'ounce', 'ounces'],
    metricUnit: 'g',
    metricFactor: { metric: 28.349523125, 'us-customary': 28.349523125, 'canadian-customary': 28.349523125 },
    displayUnit: 'oz',
  },
  {
    aliases: ['lb', 'lbs', 'pound', 'pounds'],
    metricUnit: 'g',
    metricFactor: { metric: 453.59237, 'us-customary': 453.59237, 'canadian-customary': 453.59237 },
    displayUnit: 'lb',
  },
];

const FRACTION_VALUES = new Map([
  ['¼', 0.25],
  ['½', 0.5],
  ['¾', 0.75],
  ['⅓', 1 / 3],
  ['⅔', 2 / 3],
  ['⅛', 0.125],
  ['⅜', 0.375],
  ['⅝', 0.625],
  ['⅞', 0.875],
]);

const unitPattern = UNIT_DEFINITIONS.flatMap((definition) => definition.aliases)
  .sort((a, b) => b.length - a.length)
  .map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'))
  .join('|');

const numberPattern = String.raw`(?:\d+(?:\.\d+)?|\d+\s*[\/⁄]\s*\d+|[¼½¾⅓⅔⅛⅜⅝⅞]|\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞])`;
const measurementPattern = new RegExp(String.raw`^\s*(${numberPattern})\s*(${unitPattern})\.?\s*$`, 'i');

const findUnitDefinition = (unit: string): UnitDefinition | undefined => {
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, ' ').trim();

  return UNIT_DEFINITIONS.find((definition) => definition.aliases.includes(normalizedUnit));
};

export const parseMeasurementNumber = (value: unknown): number | undefined => {
  const cleaned = cleanLine(value).replace(/⁄/g, '/');
  if (!cleaned) return undefined;

  const mixedFraction = cleaned.match(/^(\d+)\s*([¼½¾⅓⅔⅛⅜⅝⅞])$/);
  if (mixedFraction) {
    return Number(mixedFraction[1]) + (FRACTION_VALUES.get(mixedFraction[2]) ?? 0);
  }

  const fraction = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return undefined;
    return Number(fraction[1]) / denominator;
  }

  const unicodeFraction = FRACTION_VALUES.get(cleaned);
  if (typeof unicodeFraction === 'number') return unicodeFraction;

  const decimal = Number(cleaned);
  return Number.isFinite(decimal) ? decimal : undefined;
};

const roundMetricValue = (value: number): number => {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
};

const formatNumber = (value: number): string => {
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
};

export const formatMetricMeasurement = (value: number, unit: MetricMeasurementUnit): string =>
  `${formatNumber(value)}${unit}`;

const roundDisplayValue = (value: number): number => {
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
};

const UNIT_DEFINITIONS_BY_DISPLAY = new Map(
  UNIT_DEFINITIONS.map((definition) => [definition.displayUnit, definition] as const),
);

const unitByDisplay = (displayUnit: string): UnitDefinition => {
  const unitDefinition = UNIT_DEFINITIONS_BY_DISPLAY.get(displayUnit);
  if (!unitDefinition) {
    throw new Error(`Unknown display unit: ${displayUnit}`);
  }

  return unitDefinition;
};

const formatCookingDisplayMeasurement = (
  metricValue: number,
  metricUnit: MetricMeasurementUnit,
  unitSystem: MeasurementUnitSystem,
): string => {
  if (metricUnit === 'ml') {
    const tsp = unitByDisplay('tsp');
    const tbsp = unitByDisplay('tbsp');
    const cup = unitByDisplay('cup');
    const unit = metricValue >= cup.metricFactor[unitSystem]
      ? cup
      : metricValue >= tbsp.metricFactor[unitSystem]
        ? tbsp
        : tsp;

    return `${formatNumber(roundDisplayValue(metricValue / unit.metricFactor[unitSystem]))}${unit.displayUnit}`;
  }

  return formatMetricMeasurement(metricValue, metricUnit);
};

const formatImperialDisplayMeasurement = (
  metricValue: number,
  metricUnit: MetricMeasurementUnit,
): string => {
  if (metricUnit === 'ml') {
    const fluidOunce = unitByDisplay('fl oz');
    return `${formatNumber(roundDisplayValue(metricValue / fluidOunce.metricFactor.metric))}${fluidOunce.displayUnit}`;
  }

  const pound = unitByDisplay('lb');
  const ounce = unitByDisplay('oz');
  const unit = metricValue >= pound.metricFactor.metric ? pound : ounce;
  return `${formatNumber(roundDisplayValue(metricValue / unit.metricFactor.metric))}${unit.displayUnit}`;
};

const formatDisplayMeasurement = (
  metricValue: number,
  metricUnit: MetricMeasurementUnit,
  displayMode: MeasurementDisplayMode,
  unitSystem: MeasurementUnitSystem,
): string => {
  if (displayMode === 'cooking') {
    return formatCookingDisplayMeasurement(metricValue, metricUnit, unitSystem);
  }

  if (displayMode === 'imperial') {
    return formatImperialDisplayMeasurement(metricValue, metricUnit);
  }

  return formatMetricMeasurement(metricValue, metricUnit);
};

const parseMeasurementParts = (
  value: unknown,
  unitSystem: MeasurementUnitSystem,
):
  | {
      amount: number;
      unitDefinition: UnitDefinition;
      metricValue: number;
      quantity: string;
    }
  | undefined => {
  const match = cleanLine(value).match(measurementPattern);
  if (!match) return undefined;

  const amount = parseMeasurementNumber(match[1]);
  const unitDefinition = findUnitDefinition(match[2]);
  if (typeof amount !== 'number' || !unitDefinition) return undefined;

  const metricValue = roundMetricValue(amount * unitDefinition.metricFactor[unitSystem]);
  const quantity = formatMetricMeasurement(metricValue, unitDefinition.metricUnit);

  return { amount, unitDefinition, metricValue, quantity };
};

export const parseMeasurement = (
  value: unknown,
  config: CountryConfig | undefined,
): Omit<ExtractedMeasurement, 'name'> | undefined => {
  const unitSystem = config?.measurement.unitSystem ?? 'metric';
  const cleaned = cleanLine(value);
  const sourceDisplayMatch = cleaned.match(/\(\s*(?:~|approx\.?)?\s*([^)]+?)\s*\)\s*$/i);
  const parsed = parseMeasurementParts(cleaned.replace(/\s*\([^)]*\)\s*$/, ''), unitSystem);
  if (!parsed) return undefined;

  const sourceDisplay = sourceDisplayMatch
    ? parseMeasurementParts(sourceDisplayMatch[1], unitSystem)
    : undefined;
  const displayMode = config?.measurement.displayMode ?? 'metric';
  const hintedQuantityDisplay = sourceDisplay
    ? `${formatNumber(sourceDisplay.amount)}${sourceDisplay.unitDefinition.displayUnit}`
    : undefined;
  const quantityDisplay = displayMode === 'cooking' && hintedQuantityDisplay
    ? hintedQuantityDisplay
    : formatDisplayMeasurement(parsed.metricValue, parsed.unitDefinition.metricUnit, displayMode, unitSystem);

  return {
    quantity: parsed.quantity,
    quantityDisplay,
    quantityMetricValue: parsed.metricValue,
    quantityMetricUnit: parsed.unitDefinition.metricUnit,
  };
};

export const extractMeasurementQuantity = (
  value: string,
  config: CountryConfig | undefined,
): ExtractedMeasurement | undefined => {
  const cleaned = cleanLine(value);
  const dashMatch = cleaned.match(/^(.+?)\s+[–—-]\s+(.+)$/);
  if (dashMatch) {
    const measurement = parseMeasurement(dashMatch[2], config);
    if (measurement) return { name: dashMatch[1], ...measurement };
  }

  const parentheticalMatch = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parentheticalMatch) {
    const measurement = parseMeasurement(parentheticalMatch[2], config);
    if (measurement) return { name: parentheticalMatch[1], ...measurement };
  }

  const leadingMatch = cleaned.match(new RegExp(String.raw`^(${numberPattern})\s*(${unitPattern})\.?\s+(.+)$`, 'i'));
  if (leadingMatch) {
    const measurement = parseMeasurement(`${leadingMatch[1]} ${leadingMatch[2]}`, config);
    if (measurement) return { name: leadingMatch[3], ...measurement };
  }

  const trailingMatch = cleaned.match(new RegExp(String.raw`^(.+?)\s+(${numberPattern})\s*(${unitPattern})\.?$`, 'i'));
  if (trailingMatch) {
    const measurement = parseMeasurement(`${trailingMatch[2]} ${trailingMatch[3]}`, config);
    if (measurement) return { name: trailingMatch[1], ...measurement };
  }

  return undefined;
};
