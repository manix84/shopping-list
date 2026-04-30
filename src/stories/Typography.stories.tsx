import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const meta = {
  title: 'Design System/Typography',
  tags: ['autodocs'],
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
      <StorySection title="Typography">
        <div className="stack">
          <div>
            <h1 className="title">Page title</h1>
            <p className="subtitle">A short supporting line for page-level context.</p>
          </div>
          <div>
            <h2 className="title title-md">Section title</h2>
            <p className="subtitle">Used for primary cards and app-level views.</p>
          </div>
          <div>
            <h3 className="title title-sm">Panel title</h3>
            <p className="small-text">Small text carries helper copy, metadata, and quieter labels.</p>
          </div>
          <div className="section-group">Section group label</div>
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
