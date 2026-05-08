import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import type { SaveStatus } from '../types';
import { Card } from './Card';
import { SaveStatusIndicator, SAVE_CONFIRMATION_DURATION_MS, SAVE_STATUS_FADE_DURATION_MS } from './SaveStatusIndicator';
import { StoryCanvas } from './storyFixtures';

type SaveStatusIndicatorStoryArgs = {
  status: SaveStatus;
};

const meta = {
  title: 'Components/SaveStatusIndicator',
  tags: ['autodocs'],
  component: SaveStatusIndicator,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'saving', 'syncing', 'saved', 'error'],
    },
  },
} satisfies Meta<SaveStatusIndicatorStoryArgs>;

export default meta;

type Story = StoryObj<SaveStatusIndicatorStoryArgs>;

const labelForStatus = (status: SaveStatus) =>
  status === 'saving'
    ? /saving/i
    : status === 'syncing' ? /syncing/i : status === 'saved' ? /saved/i : status === 'error' ? /save failed/i : undefined;

const playSaveStatusIndicator: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const label = labelForStatus(args.status);

  if (!label) {
    await expect(canvas.getByText('No visible save status')).toBeVisible();
    return;
  }

  await waitFor(() => expect(canvas.getByRole('status')).toHaveAccessibleName(label));

  if (args.status === 'saved') {
    await waitFor(
      () => expect(canvas.queryByRole('status')).not.toBeInTheDocument(),
      { timeout: SAVE_CONFIRMATION_DURATION_MS + SAVE_STATUS_FADE_DURATION_MS + 500 },
    );
  }
};

function SaveStatusIndicatorExample({ status }: SaveStatusIndicatorStoryArgs) {
  return (
    <StoryCanvas>
      <Card
        header={
          <div className={'page-title-with-status'}>
            <h2 className={'title title-sm'}>List editor</h2>
            <SaveStatusIndicator status={status} />
          </div>
        }
        bodyClassName={'stack'}
      >
        <p className={'small-text'}>{status === 'idle' ? 'No visible save status' : `Current status: ${status}`}</p>
      </Card>
    </StoryCanvas>
  );
}

export const Saving: Story = {
  args: {
    status: 'saving',
  },
  render: (args) => <SaveStatusIndicatorExample {...args} />,
  play: playSaveStatusIndicator,
};

export const Saved: Story = {
  args: {
    status: 'saved',
  },
  render: Saving.render,
  play: playSaveStatusIndicator,
};

export const Syncing: Story = {
  args: {
    status: 'syncing',
  },
  render: Saving.render,
  play: playSaveStatusIndicator,
};

export const Failed: Story = {
  args: {
    status: 'error',
  },
  render: Saving.render,
  play: playSaveStatusIndicator,
};

export const Idle: Story = {
  args: {
    status: 'idle',
  },
  render: Saving.render,
  play: playSaveStatusIndicator,
};
