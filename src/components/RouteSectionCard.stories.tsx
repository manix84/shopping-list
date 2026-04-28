import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteSectionCard } from './RouteSectionCard';
import { noop, sampleSection, StoryCanvas } from './storyFixtures';

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

export const Default: Story = {
  args: {
    section: sampleSection,
    viewMode: 'default',
    onToggleSection: noop,
    onToggleItem: noop,
  },
  render: (args) => (
    <StoryCanvas>
      <RouteSectionCard {...args} />
    </StoryCanvas>
  ),
};

export const Comfortable: Story = {
  args: {
    ...Default.args,
    viewMode: 'comfortable',
  },
  render: Default.render,
};

export const Compact: Story = {
  args: {
    ...Default.args,
    viewMode: 'compact',
  },
  render: Default.render,
};
