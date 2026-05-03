import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const meta = {
  title: 'Design System/Empty States',
  parameters: {
    docs: {
      description: {
        component: 'Quiet placeholder treatment for empty, loading, and unavailable states.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Empty States'}>
        <div className={'empty-state'}>Empty, loading, and unavailable states use this quiet dashed treatment.</div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/empty, loading, and unavailable states/i)).toBeVisible();
  },
};
