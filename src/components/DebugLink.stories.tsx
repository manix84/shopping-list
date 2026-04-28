import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { DebugLink } from './DebugLink';
import { noop, StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/DebugLink',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Link: Story = {
  render: () => (
    <StoryCanvas>
      <Card bodyClassName="stack">
        <DebugLink onOpen={noop} />
      </Card>
    </StoryCanvas>
  ),
};
