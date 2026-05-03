import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

const playCountrySelect: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const select = canvas.getByLabelText('Store layout profile');

  await expect(select).toHaveValue(args.value);
  await userEvent.selectOptions(select, 'us');
  await expect(select).toHaveValue('us');
};

function CountrySelectExample({ value }: { value: CountryCode }) {
  const [countryCode, setCountryCode] = useState<CountryCode>(value);

  return (
    <StoryCanvas>
      <Card bodyClassName={'stack'}>
        <div className={'field field-compact'}>
          <label htmlFor={'storybook-country'}>Store layout profile</label>
          <CountrySelect id={'storybook-country'} value={countryCode} onChange={setCountryCode} />
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
  play: playCountrySelect,
};

export const UnitedStates: Story = {
  args: {
    ...UnitedKingdom.args,
    value: 'us',
  },
  render: UnitedKingdom.render,
  play: playCountrySelect,
};

export const Canada: Story = {
  args: {
    ...UnitedKingdom.args,
    value: 'ca',
  },
  render: UnitedKingdom.render,
  play: playCountrySelect,
};
