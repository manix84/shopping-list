import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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

const playTestResultCard: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText(args.title)).toBeVisible();
  await expect(canvas.getByText(new RegExp(`expected ${args.expected}`, 'i'))).toBeVisible();
  await expect(canvas.getByText(new RegExp(`got ${args.actual}`, 'i'))).toBeVisible();
  await expect(canvas.getByText(args.label ?? (args.passed ? 'Pass' : 'Fail'))).toBeVisible();
};

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
  play: playTestResultCard,
};

export const Failing: Story = {
  args: {
    title: 'Matcher assigns section',
    expected: 'Produce',
    actual: 'Other',
    passed: false,
  },
  render: Passing.render,
  play: playTestResultCard,
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
  play: playTestResultCard,
};
