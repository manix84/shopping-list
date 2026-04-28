import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { PwaInstallBadge } from './PwaInstallBadge';
import { noop, StoryCanvas } from './storyFixtures';

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

export const PromptAvailable: Story = {
  args: {
    canPromptInstall: true,
    isVisible: true,
    onDismiss: noop,
    onInstall: noop,
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
};

export const ManualInstallGuidance: Story = {
  args: {
    canPromptInstall: false,
    isVisible: true,
    onDismiss: noop,
    onInstall: noop,
  },
  render: PromptAvailable.render,
};

export const Hidden: Story = {
  args: {
    canPromptInstall: true,
    isVisible: false,
    onDismiss: noop,
    onInstall: noop,
  },
  render: PromptAvailable.render,
};
