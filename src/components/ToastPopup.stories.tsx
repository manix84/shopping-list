import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ToastPopup } from './ToastPopup';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/ToastPopup',
  tags: ['autodocs'],
  component: ToastPopup,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error'],
    },
    showIcon: { control: 'boolean' },
  },
} satisfies Meta<typeof ToastPopup>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderToast: Story['render'] = (args) => (
  <StoryCanvas>
    <ToastPopup {...args} />
  </StoryCanvas>
);

const playStatusToast: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const popup = canvas.getByRole(args.tone === 'error' ? 'alert' : 'status');

  await expect(popup).toHaveTextContent(args.message);
  if (args.title) {
    await expect(popup).toHaveTextContent(args.title);
  }
};

export const Success: Story = {
  args: {
    id: 1,
    tone: 'success',
    title: 'Debug mode enabled',
    message: 'Debug tools are now available in the main menu.',
    showIcon: true,
  },
  render: renderToast,
  play: playStatusToast,
};

export const Info: Story = {
  args: {
    id: 2,
    tone: 'info',
    title: 'Already enabled',
    message: 'Debug mode is already enabled. No need to keep tapping.',
    showIcon: true,
  },
  render: renderToast,
  play: playStatusToast,
};

export const Warning: Story = {
  args: {
    id: 3,
    tone: 'warning',
    title: 'Check needed',
    message: 'Some settings may need attention before continuing.',
    showIcon: true,
  },
  render: renderToast,
  play: playStatusToast,
};

export const Error: Story = {
  args: {
    id: 4,
    tone: 'error',
    title: 'Save failed',
    message: 'Your latest changes could not be saved.',
    showIcon: true,
  },
  render: renderToast,
  play: playStatusToast,
};

export const NoTitleOrIcon: Story = {
  args: {
    id: 5,
    tone: 'success',
    message: 'Saved locally.',
    showIcon: false,
  },
  render: renderToast,
  play: playStatusToast,
};

export const NoTitle: Story = {
  args: {
    id: 6,
    tone: 'info',
    message: 'Route refreshed.',
    showIcon: true,
  },
  render: renderToast,
  play: playStatusToast,
};
