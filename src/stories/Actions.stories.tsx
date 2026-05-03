import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const meta = {
  title: 'Design System/Actions',
  parameters: {
    docs: {
      description: {
        component: 'Button styles used for primary, secondary, dangerous, and link actions.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Actions'}>
        <div className={'button-row'}>
          <button type={'button'} className={'button button-primary'}>
            Primary action
          </button>
          <button type={'button'} className={'button'}>
            Secondary action
          </button>
          <button type={'button'} className={'button button-danger'}>
            Dangerous action
          </button>
          <button type={'button'} className={'button button-link'}>
            Link action
          </button>
        </div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /primary action/i })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /dangerous action/i })).toBeVisible();
  },
};
