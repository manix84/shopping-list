import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const Empty: Story = {
  args: {
    total: 0,
    checkedTotal: 0,
    progress: 0,
  },
  render: InProgress.render,
};

export const Complete: Story = {
  args: {
    total: 24,
    checkedTotal: 24,
    progress: 100,
  },
  render: InProgress.render,
};
