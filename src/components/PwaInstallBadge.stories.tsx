import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card } from './Card';
import { PwaInstallBadge } from './PwaInstallBadge';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/PwaInstallBadge',
  tags: ['autodocs'],
  component: PwaInstallBadge,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    canPromptInstall: { control: 'boolean' },
    isVisible: { control: 'boolean' },
  },
} satisfies Meta<typeof PwaInstallBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

const playVisibleInstallBadge: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByRole('heading', { name: /install the app/i })).toBeVisible();

  if (args.canPromptInstall) {
    await userEvent.click(canvas.getByRole('button', { name: /^install$/i }));
    await expect(args.onInstall).toHaveBeenCalledTimes(1);
  } else {
    await expect(canvas.queryByRole('button', { name: /^install$/i })).not.toBeInTheDocument();
  }

  await userEvent.click(canvas.getByRole('button', { name: /dismiss install prompt/i }));
  await expect(args.onDismiss).toHaveBeenCalledTimes(1);
};

export const PromptAvailable: Story = {
  args: {
    canPromptInstall: true,
    isVisible: true,
    onDismiss: fn(),
    onInstall: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <Card bodyClassName="stack">
        <p className="small-text">
          The floating install badge is fixed to the viewport bottom, matching the production behavior.
        </p>
      </Card>
      <PwaInstallBadge {...args} />
    </StoryCanvas>
  ),
  play: playVisibleInstallBadge,
};

export const ManualInstallGuidance: Story = {
  args: {
    canPromptInstall: false,
    isVisible: true,
    onDismiss: fn(),
    onInstall: fn(),
  },
  render: PromptAvailable.render,
  play: playVisibleInstallBadge,
};

export const Hidden: Story = {
  args: {
    canPromptInstall: true,
    isVisible: false,
    onDismiss: fn(),
    onInstall: fn(),
  },
  render: PromptAvailable.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('heading', { name: /install the app/i })).not.toBeInTheDocument();
  },
};
