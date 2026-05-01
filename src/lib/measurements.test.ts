import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { withIngredientModeDisplay } from './ingredientMode';
import {
  extractMeasurementQuantity,
  formatMetricMeasurement,
  parseMeasurement,
  parseMeasurementNumber,
} from './measurements';

describe('measurement helpers', () => {
  it.each([
    ['1⁄2', 0.5],
    ['1/2', 0.5],
    ['½', 0.5],
    ['2½', 2.5],
    ['1¼', 1.25],
    ['⅓', 1 / 3],
    ['1 / 0', undefined],
    ['roughly half', undefined],
    [undefined, undefined],
  ])('parses measurement number %s', (input, expected) => {
    expect(parseMeasurementNumber(input)).toBe(expected);
  });

  it('formats metric measurements without trailing decimal zeroes', () => {
    expect(formatMetricMeasurement(20, 'ml')).toBe('20ml');
    expect(formatMetricMeasurement(2.5, 'ml')).toBe('2.5ml');
    expect(formatMetricMeasurement(1500, 'g')).toBe('1500g');
  });

  it('parses metric storage values for metric country profiles', () => {
    expect(parseMeasurement('1.5kg', UK_CONFIG)).toEqual({
      quantity: '1500g',
      quantityDisplay: '1500g',
      quantityMetricValue: 1500,
      quantityMetricUnit: 'g',
    });
    expect(parseMeasurement('½ tsp', UK_CONFIG)).toEqual({
      quantity: '2.5ml',
      quantityDisplay: '2.5ml',
      quantityMetricValue: 2.5,
      quantityMetricUnit: 'ml',
    });
  });

  it('keeps storage metric while switching display mode for cup and spoon countries', () => {
    expect(parseMeasurement('½ tsp', withIngredientModeDisplay(US_CONFIG, false))).toMatchObject({
      quantity: '2.46ml',
      quantityDisplay: '2.46ml',
    });
    expect(parseMeasurement('½ tsp', withIngredientModeDisplay(US_CONFIG, true))).toMatchObject({
      quantity: '2.46ml',
      quantityDisplay: '0.5tsp',
    });
    expect(parseMeasurement('1 cup', withIngredientModeDisplay(CA_CONFIG, true))).toMatchObject({
      quantity: '250ml',
      quantityDisplay: '1cup',
    });
  });

  it('prefers parenthetical source display hints when ingredient mode is enabled', () => {
    expect(parseMeasurement('20 ml (~4 tsp)', withIngredientModeDisplay(CA_CONFIG, true))).toEqual({
      quantity: '20ml',
      quantityDisplay: '4tsp',
      quantityMetricValue: 20,
      quantityMetricUnit: 'ml',
    });
    expect(parseMeasurement('12 ml (approx. 2½ tsp)', withIngredientModeDisplay(US_CONFIG, true))).toMatchObject({
      quantity: '12ml',
      quantityDisplay: '2.5tsp',
    });
  });

  it('extracts measurement quantities from dash, leading, trailing, and parenthetical forms', () => {
    expect(extractMeasurementQuantity('Liquid smoke – ½ tsp', UK_CONFIG)).toMatchObject({
      name: 'Liquid smoke',
      quantity: '2.5ml',
    });
    expect(extractMeasurementQuantity('500g mince', UK_CONFIG)).toMatchObject({
      name: 'mince',
      quantity: '500g',
    });
    expect(extractMeasurementQuantity('mince 500g', UK_CONFIG)).toMatchObject({
      name: 'mince',
      quantity: '500g',
    });
    expect(extractMeasurementQuantity('Mayonnaise (25ml)', UK_CONFIG)).toMatchObject({
      name: 'Mayonnaise',
      quantity: '25ml',
    });
  });

  it('rejects text that is not a measurement', () => {
    expect(parseMeasurement('half spoon', UK_CONFIG)).toBeUndefined();
    expect(parseMeasurement('1 pinch', UK_CONFIG)).toBeUndefined();
    expect(extractMeasurementQuantity('Mayonnaise (full-fat)', UK_CONFIG)).toBeUndefined();
    expect(extractMeasurementQuantity('plain mayonnaise', UK_CONFIG)).toBeUndefined();
  });
});
