import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { UK_CONFIG } from '../config/countries/uk';
import { ParsedItemCard } from './ParsedItemCard';
import { sampleItems, StoryCanvas } from './storyFixtures';

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

const playParsedItemCard: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');

  await expect(input).toBeVisible();
  await expect(input).toHaveAccessibleName(/edit list:/i);

  await userEvent.click(canvas.getByRole('button', { name: args.item.checked ? /untick/i : /tick/i }));
  await expect(args.onToggle).toHaveBeenCalledWith(args.item.id);

  await userEvent.click(canvas.getByRole('button', { name: /remove/i }));
  await expect(args.onDelete).toHaveBeenCalledWith(args.item.id);

  await userEvent.clear(input);
  await userEvent.type(input, 'updated item');
  await userEvent.tab();
  await expect(args.onRename).toHaveBeenCalledWith(args.item.id, 'updated item');
};

export const WithQuantityAndVariant: Story = {
  args: {
    item: sampleItems[0],
    config: UK_CONFIG,
    onRename: fn(),
    onToggle: fn(),
    onDelete: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <ParsedItemCard {...args} />
    </StoryCanvas>
  ),
  play: playParsedItemCard,
};

export const CheckedSimpleItem: Story = {
  args: {
    ...WithQuantityAndVariant.args,
    item: sampleItems[1],
  },
  render: WithQuantityAndVariant.render,
  play: playParsedItemCard,
};

export const UnitQuantityItem: Story = {
  args: {
    ...WithQuantityAndVariant.args,
    item: sampleItems[2],
  },
  render: WithQuantityAndVariant.render,
  play: playParsedItemCard,
};
