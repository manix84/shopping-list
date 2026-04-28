import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/Badge',
  tags: ['autodocs'],
  component: Badge,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['default', 'success', 'danger', 'muted'],
    },
    children: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default',
    tone: 'default',
  },
  render: (args) => (
    <StoryCanvas>
      <Badge {...args} />
    </StoryCanvas>
  ),
};

export const Success: Story = {
  args: {
    children: 'Done',
    tone: 'success',
  },
  render: Default.render,
};

export const Danger: Story = {
  args: {
    children: 'Needs attention',
    tone: 'danger',
  },
  render: Default.render,
};

export const Muted: Story = {
  args: {
    children: 'Optional',
    tone: 'muted',
  },
  render: Default.render,
};
