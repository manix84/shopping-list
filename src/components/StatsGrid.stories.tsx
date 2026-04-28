import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { StatsGrid } from './StatsGrid';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/StatsGrid',
  tags: ['autodocs'],
  component: StatsGrid,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    total: { control: { type: 'number', min: 0 } },
    checkedTotal: { control: { type: 'number', min: 0 } },
    progress: { control: { type: 'number', min: 0, max: 100 } },
  },
} satisfies Meta<typeof StatsGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

const playStatsGrid: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getAllByText(String(args.total))[0]).toBeVisible();
  await expect(canvas.getAllByText(String(args.checkedTotal))[0]).toBeVisible();
  await expect(canvas.getByText(`${args.progress}%`)).toBeVisible();
};

export const InProgress: Story = {
  args: {
    total: 18,
    checkedTotal: 11,
    progress: 61,
  },
  render: (args) => (
    <StoryCanvas>
      <StatsGrid {...args} />
    </StoryCanvas>
  ),
  play: playStatsGrid,
};

export const Empty: Story = {
  args: {
    total: 0,
    checkedTotal: 0,
    progress: 0,
  },
  render: InProgress.render,
  play: playStatsGrid,
};

export const Complete: Story = {
  args: {
    total: 24,
    checkedTotal: 24,
    progress: 100,
  },
  render: InProgress.render,
  play: playStatsGrid,
};
