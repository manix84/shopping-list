import { describe, expect, it } from 'vitest';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { withMeasurementDisplayMode } from './ingredientMode';
import { parseMeasurementNumber } from './measurements';
import { extractQuantifiedItem, extractQuantity, formatCountQuantity, parseQuantityValue } from './quantity';

describe('quantity helpers', () => {
  it('formats count quantities', () => {
    expect(formatCountQuantity(2)).toBe('x2');
  });

  it.each([
    ['x2', 2],
    ['x 2', 2],
    ['2x', 2],
    ['2 x', 2],
    ['2', 2],
    ['1.5', 1.5],
    ['x1.5', 1.5],
  ])('parses %s', (input, expected) => {
    expect(parseQuantityValue(input)).toBe(expected);
  });

  it.each(['two', 'x', '2kg', '', undefined])('rejects non-count quantity %s', (input) => {
    expect(parseQuantityValue(input)).toBeUndefined();
  });

  it.each([
    ['bananas x2', { name: 'bananas', quantity: 'x2', quantityValue: 2 }],
    ['2x apples', { name: 'apples', quantity: 'x2', quantityValue: 2 }],
    ['x3 pears', { name: 'pears', quantity: 'x3', quantityValue: 3 }],
    ['4 carrots', { name: 'carrots', quantity: 'x4', quantityValue: 4 }],
    ['500g mince', { name: 'mince', quantity: '500g' }],
    ['mince 500g', { name: 'mince', quantity: '500g' }],
    ['1.5kg potatoes', { name: 'potatoes', quantity: '1500g' }],
  ])('extracts %s', (input, expected) => {
    expect(extractQuantity(input)).toMatchObject(expected);
  });

  it('returns a trimmed name when there is no quantity', () => {
    expect(extractQuantity('  bananas  ')).toEqual({ name: 'bananas', quantity: undefined });
  });

  it('extracts count and unit quantity together', () => {
    expect(extractQuantifiedItem('2x 500g bags of rice')).toMatchObject({
      name: 'bags of rice',
      quantity: '500g',
      quantityValue: 2,
    });
  });

  it.each([
    ['1⁄2', 0.5],
    ['½', 0.5],
    ['2½', 2.5],
    ['1¼', 1.25],
  ])('parses measurement number %s', (input, expected) => {
    expect(parseMeasurementNumber(input)).toBe(expected);
  });

  it('stores metric quantities for UK measurements', () => {
    expect(extractQuantifiedItem('Liquid smoke – ½ tsp', UK_CONFIG)).toMatchObject({
      name: 'Liquid smoke',
      quantity: '2.5ml',
      quantityDisplay: '2.5ml',
      quantityMetricValue: 2.5,
      quantityMetricUnit: 'ml',
    });
    expect(extractQuantifiedItem('Sugar – 20 ml (~4 tsp)', UK_CONFIG)).toMatchObject({
      name: 'Sugar',
      quantity: '20ml',
      quantityDisplay: '20ml',
      quantityMetricValue: 20,
      quantityMetricUnit: 'ml',
    });
    expect(extractQuantifiedItem('Mayonnaise (25ml)', UK_CONFIG)).toMatchObject({
      name: 'Mayonnaise',
      quantity: '25ml',
      quantityDisplay: '25ml',
      quantityMetricValue: 25,
      quantityMetricUnit: 'ml',
    });
  });

  it('stores metric values while using metric display for US and Canada by default', () => {
    expect(extractQuantifiedItem('Liquid smoke – ½ tsp', US_CONFIG)).toMatchObject({
      name: 'Liquid smoke',
      quantity: '2.46ml',
      quantityDisplay: '2.46ml',
      quantityMetricValue: 2.46,
      quantityMetricUnit: 'ml',
    });
    expect(extractQuantifiedItem('Oil – 1 cup', CA_CONFIG)).toMatchObject({
      name: 'Oil',
      quantity: '250ml',
      quantityDisplay: '250ml',
      quantityMetricValue: 250,
      quantityMetricUnit: 'ml',
    });
  });

  it('stores metric values while preserving US and Canada cup and spoon display in cooking mode', () => {
    expect(extractQuantifiedItem('Liquid smoke – ½ tsp', withMeasurementDisplayMode(US_CONFIG, 'cooking'))).toMatchObject({
      name: 'Liquid smoke',
      quantity: '2.46ml',
      quantityDisplay: '0.5tsp',
      quantityMetricValue: 2.46,
      quantityMetricUnit: 'ml',
    });
    expect(extractQuantifiedItem('Sugar – 20 ml (~4 tsp)', CA_CONFIG)).toMatchObject({
      name: 'Sugar',
      quantity: '20ml',
      quantityDisplay: '20ml',
      quantityMetricValue: 20,
      quantityMetricUnit: 'ml',
    });
    expect(extractQuantifiedItem('Sugar – 20 ml (~4 tsp)', withMeasurementDisplayMode(CA_CONFIG, 'cooking'))).toMatchObject({
      name: 'Sugar',
      quantity: '20ml',
      quantityDisplay: '4tsp',
      quantityMetricValue: 20,
      quantityMetricUnit: 'ml',
    });
  });
});
