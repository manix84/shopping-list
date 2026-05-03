import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Card } from './Card';
import { DebugLink } from './DebugLink';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/DebugLink',
  tags: ['autodocs'],
  component: DebugLink,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DebugLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Link: Story = {
  args: {
    onOpen: fn(),
  },
  render: (args) => (
    <StoryCanvas>
      <Card bodyClassName={'stack'}>
        <DebugLink {...args} />
      </Card>
    </StoryCanvas>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /open debug tools/i }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
  },
};
