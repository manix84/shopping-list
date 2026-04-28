import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RouteSectionCard } from './RouteSectionCard';
import { sampleSection, StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/RouteSectionCard',
  tags: ['autodocs'],
  component: RouteSectionCard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    viewMode: {
      control: 'select',
      options: ['default', 'comfortable', 'compact'],
    },
  },
} satisfies Meta<typeof RouteSectionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const playRouteSectionCard: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByRole('heading', { name: args.section.label })).toBeVisible();
  await expect(canvas.getByText(args.section.groupLabel)).toBeVisible();

  await userEvent.click(canvas.getByRole('checkbox', { name: /oat milk/i }));
  await expect(args.onToggleItem).toHaveBeenCalledWith('item-1');

  if (args.viewMode !== 'compact') {
    await userEvent.click(canvas.getByRole('button', { name: /tick all/i }));
    await expect(args.onToggleSection).toHaveBeenCalledWith(args.section.key, true);
  }
};

export const Default: Story = {
  args: {
    section: sampleSection,
    viewMode: 'default',
    onToggleSection: fn(),
    onToggleItem: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <RouteSectionCard {...args} />
    </StoryCanvas>
  ),
  play: playRouteSectionCard,
};

export const Comfortable: Story = {
  args: {
    ...Default.args,
    viewMode: 'comfortable',
  },
  render: Default.render,
  play: playRouteSectionCard,
};

export const Compact: Story = {
  args: {
    ...Default.args,
    viewMode: 'compact',
  },
  render: Default.render,
  play: playRouteSectionCard,
};
