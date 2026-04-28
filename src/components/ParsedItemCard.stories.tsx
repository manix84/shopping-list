import type { Meta, StoryObj } from '@storybook/react-vite';
import { UK_CONFIG } from '../config/countries/uk';
import { ParsedItemCard } from './ParsedItemCard';
import { noop, sampleItems, StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/ParsedItemCard',
  tags: ['autodocs'],
  component: ParsedItemCard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    item: { control: false },
    config: { control: false },
    onRename: { control: false },
    onToggle: { control: false },
    onDelete: { control: false },
  },
} satisfies Meta<typeof ParsedItemCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithQuantityAndVariant: Story = {
  args: {
    item: sampleItems[0],
    config: UK_CONFIG,
    onRename: noop,
    onToggle: noop,
    onDelete: noop,
  },
  render: (args) => (
    <StoryCanvas>
      <ParsedItemCard {...args} />
    </StoryCanvas>
  ),
};

export const CheckedSimpleItem: Story = {
  args: {
    ...WithQuantityAndVariant.args,
    item: sampleItems[1],
  },
  render: WithQuantityAndVariant.render,
};

export const UnitQuantityItem: Story = {
  args: {
    ...WithQuantityAndVariant.args,
    item: sampleItems[2],
  },
  render: WithQuantityAndVariant.render,
};
