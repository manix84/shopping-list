import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { CountryCode } from '../types';
import { Card } from './Card';
import { CountrySelect } from './CountrySelect';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/CountrySelect',
  tags: ['autodocs'],
  component: CountrySelect,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['uk', 'us', 'ca'],
    },
  },
} satisfies Meta<typeof CountrySelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function CountrySelectExample({ value }: { value: CountryCode }) {
  const [countryCode, setCountryCode] = useState<CountryCode>(value);

  return (
    <StoryCanvas>
      <Card bodyClassName="stack">
        <div className="field field-compact">
          <label htmlFor="storybook-country">Store layout profile</label>
          <CountrySelect id="storybook-country" value={countryCode} onChange={setCountryCode} />
        </div>
      </Card>
    </StoryCanvas>
  );
}

export const UnitedKingdom: Story = {
  args: {
    id: 'storybook-country',
    value: 'uk',
    onChange: () => undefined,
  },
  render: (args) => <CountrySelectExample value={args.value} />,
};

export const UnitedStates: Story = {
  args: {
    ...UnitedKingdom.args,
    value: 'us',
  },
  render: UnitedKingdom.render,
};

export const Canada: Story = {
  args: {
    ...UnitedKingdom.args,
    value: 'ca',
  },
  render: UnitedKingdom.render,
};
