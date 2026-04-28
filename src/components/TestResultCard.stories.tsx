import type { Meta, StoryObj } from '@storybook/react-vite';
import { TestResultCard } from './TestResultCard';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/TestResultCard',
  tags: ['autodocs'],
  component: TestResultCard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    expected: { control: 'text' },
    actual: { control: 'text' },
    passed: { control: 'boolean' },
    tone: {
      control: 'select',
      options: ['default', 'success', 'danger', 'muted'],
    },
    label: { control: 'text' },
  },
} satisfies Meta<typeof TestResultCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Passing: Story = {
  args: {
    title: 'Parser keeps quantity',
    expected: '2',
    actual: '2',
    passed: true,
  },
  render: (args) => (
    <StoryCanvas>
      <TestResultCard {...args} />
    </StoryCanvas>
  ),
};

export const Failing: Story = {
  args: {
    title: 'Matcher assigns section',
    expected: 'Produce',
    actual: 'Other',
    passed: false,
  },
  render: Passing.render,
};

export const CustomLabel: Story = {
  args: {
    title: 'Backend mode',
    expected: 'Available',
    actual: 'Skipped locally',
    passed: true,
    tone: 'muted',
    label: 'Skipped',
  },
  render: Passing.render,
};
