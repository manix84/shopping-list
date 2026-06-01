import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';
import { p } from '../styles/primitives';

const meta = {
  title: 'Design System/Typography',
  parameters: {
    docs: {
      description: {
        component: 'Type styles used for page titles, section headings, helper copy, and group labels.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Typography'}>
        <div className={p.stack}>
          <div>
            <h1 className={p.title}>Page title</h1>
            <p className={p.subtitle}>A short supporting line for page-level context.</p>
          </div>
          <div>
            <h2 className={p.titleMd}>Section title</h2>
            <p className={p.subtitle}>Used for primary cards and app-level views.</p>
          </div>
          <div>
            <h3 className={p.titleSm}>Panel title</h3>
            <p className={p.smallText}>Small text carries helper copy, metadata, and quieter labels.</p>
          </div>
          <div className={p.sectionGroup}>Section group label</div>
        </div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: /page title/i })).toBeVisible();
    await expect(canvas.getByText('Section group label')).toBeVisible();
  },
};
