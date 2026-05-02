import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CA_CONFIG } from '../config/countries/ca';
import { UK_CONFIG } from '../config/countries/uk';
import { US_CONFIG } from '../config/countries/us';
import { withMeasurementDisplayMode } from '../lib/ingredientMode';
import { extractQuantifiedItem } from '../lib/quantity';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const examples = [
  'Liquid smoke – ½ tsp',
  'Onion powder – 12 ml (~2½ tsp)',
  'Oil – 1 cup',
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

const meta = {
  title: 'Design System/Measurements',
  tags: ['autodocs'],
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
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Measurements')).toBeVisible();
    await expect(canvas.getAllByText('2.5ml')[0]).toBeVisible();
    await expect(canvas.getAllByText('0.5tsp')[0]).toBeVisible();
    await expect(canvas.getAllByText(/United States - metric display/i)[0]).toBeVisible();
    await expect(canvas.getAllByText(/United Kingdom - imperial display/i)[0]).toBeVisible();
  },
};
