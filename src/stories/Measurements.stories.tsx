import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { withMeasurementDisplayMode } from '../lib/ingredientMode';
import { parseMeasurement } from '../lib/measurements';
import { extractQuantifiedItem } from '../lib/quantity';
import type { CountryConfig, MeasurementDisplayMode } from '../types';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const examples = [
  'Liquid smoke – ½ tsp',
  'Onion powder – 12 ml (~2½ tsp)',
  'Smoked paprika – 2 1/2 tsp',
  'Oil – 1 cup',
  'Vinegar – 8 fl. oz',
  'Potatoes – 1.5kg',
];

const configs = [
  { label: 'United Kingdom', config: UK_CONFIG },
  { label: 'United Kingdom - imperial display', config: withMeasurementDisplayMode(UK_CONFIG, 'imperial') },
  { label: 'United States - metric display', config: withMeasurementDisplayMode(US_CONFIG, 'metric') },
  { label: 'United States - cooking display', config: withMeasurementDisplayMode(US_CONFIG, 'cooking') },
  { label: 'Canada - metric display', config: withMeasurementDisplayMode(CA_CONFIG, 'metric') },
  { label: 'Canada - cooking display', config: withMeasurementDisplayMode(CA_CONFIG, 'cooking') },
];

const displayModes: Array<{ label: string; mode: MeasurementDisplayMode }> = [
  { label: 'Metric', mode: 'metric' },
  { label: 'Imperial', mode: 'imperial' },
  { label: 'Cooking', mode: 'cooking' },
];

const conversionExamples: Array<{ label: string; input: string; config: CountryConfig }> = [
  { label: 'UK spoon', input: '½ tsp', config: UK_CONFIG },
  { label: 'US spoon', input: '½ tsp', config: US_CONFIG },
  { label: 'Canadian cup', input: '1 cup', config: CA_CONFIG },
  { label: 'UK fluid ounces', input: '8 fl. oz', config: UK_CONFIG },
  { label: 'UK mixed fraction', input: '2 1/2 tsp', config: UK_CONFIG },
  { label: 'Metric liquid', input: '250ml', config: UK_CONFIG },
  { label: 'Metric weight', input: '500g', config: UK_CONFIG },
  { label: 'Hinted cooking display', input: '20 ml (~4 tsp)', config: CA_CONFIG },
];

const displayMeasurement = (
  input: string,
  config: CountryConfig,
  displayMode: MeasurementDisplayMode,
) => {
  const parsed = parseMeasurement(input, withMeasurementDisplayMode(config, displayMode));
  return parsed?.quantityDisplay ?? parsed?.quantity ?? 'Not parsed';
};

const meta = {
  title: 'Design System/Measurements',
  parameters: {
    docs: {
      description: {
        component: 'Measurement parsing stores metric quantities while allowing country-specific display.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title="Measurements">
        <p className="subtitle" style={{ marginTop: 0 }}>
          Parsed measurements are normalized to metric storage. Measurement display mode can show metric, imperial,
          or cooking units without changing the stored value.
        </p>
        <div className="table-wrap">
          <table className="debug-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Input</th>
                <th>Name</th>
                <th>Stored metric</th>
                <th>Displayed</th>
              </tr>
            </thead>
            <tbody>
              {configs.flatMap(({ label, config }) =>
                examples.map((example) => {
                  const parsed = extractQuantifiedItem(example, config);

                  return (
                    <tr key={`${label}-${example}`}>
                      <td>{label}</td>
                      <td>{example}</td>
                      <td>{parsed.name}</td>
                      <td>{parsed.quantity}</td>
                      <td>{parsed.quantityDisplay ?? parsed.quantity}</td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      </StorySection>

      <StorySection title="Conversions">
        <p className="subtitle" style={{ marginTop: 0 }}>
          The stored value remains metric. The display columns show how the same source input is rendered in each
          measurement mode.
        </p>
        <div className="table-wrap">
          <table className="debug-table">
            <thead>
              <tr>
                <th>Input</th>
                <th>Profile</th>
                <th>Stored metric</th>
                {displayModes.map(({ label }) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conversionExamples.map(({ label, input, config }) => {
                const stored = parseMeasurement(input, withMeasurementDisplayMode(config, 'metric'));

                return (
                  <tr key={`${label}-${input}`}>
                    <td>{input}</td>
                    <td>{label}</td>
                    <td>{stored?.quantity ?? 'Not parsed'}</td>
                    {displayModes.map(({ label: displayLabel, mode }) => (
                      <td key={`${input}-${displayLabel}`}>
                        {displayMeasurement(input, config, mode)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Measurements')).toBeVisible();
    await expect(canvas.getAllByText('2.5ml')[0]).toBeVisible();
    await expect(canvas.getAllByText('0.5tsp')[0]).toBeVisible();
    await expect(canvas.getAllByText(/United States - metric display/i)[0]).toBeVisible();
    await expect(canvas.getAllByText(/United Kingdom - imperial display/i)[0]).toBeVisible();
    await expect(canvas.getByText('Conversions')).toBeVisible();
    await expect(canvas.getAllByText('8.8fl oz')[0]).toBeVisible();
    await expect(canvas.getAllByText('1.1lb')[0]).toBeVisible();
  },
};
