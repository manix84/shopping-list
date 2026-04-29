import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

interface ColorGroup {
  title: string;
  subtitle?: string;
  colors: Record<string, string>;
}

const colorGroups: ColorGroup[] = [
  {
    title: 'Surface',
    colors: {
      Background: 'var(--bg)',
      Panel: 'var(--panel)',
      'Panel alt': 'var(--panel-alt)',
      Border: 'var(--border)',
      Shadow: 'var(--shadow-color)',
    },
  },
  {
    title: 'Text',
    colors: {
      Text: 'var(--text)',
      Muted: 'var(--muted)',
    },
  },
  {
    title: 'Action',
    colors: {
      Primary: 'var(--primary)',
      'Primary strong': 'var(--primary-strong)',
      Danger: 'var(--danger)',
      'Danger strong': 'var(--danger-strong)',
    },
  },
  {
    title: 'Feedback/background',
    colors: {
      Success: 'var(--success-bg)',
      Danger: 'var(--danger-bg)',
      Muted: 'var(--muted-bg)',
    },
  },
  {
    title: 'Feedback/text',
    colors: {
      Success: 'var(--success-text)',
      Danger: 'var(--danger-text)',
      Muted: 'var(--muted-text)',
    },
  },
  {
    title: 'Feedback/border',
    colors: {
      Success: 'var(--success-border)',
      Danger: 'var(--danger-border)',
      Muted: 'var(--muted-border)',
    },
  },
];

const meta = {
  title: 'Design System/Color Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'CSS color variables defined in src/styles/main.scss.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ColorSection({ title, subtitle, colors }: ColorGroup) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h3 className="title title-xs" style={{ margin: '0 0 0.25rem' }}>
        {title}
      </h3>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        }}
      >
        {Object.entries(colors).map(([name, value]) => (
          <div
            key={`${title}-${name}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                background: value,
                borderBottom: '1px solid var(--border)',
                height: 72,
              }}
            />
            <div style={{ padding: '0.75rem' }}>
              <strong>{name}</strong>
              <div className="small-text">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title="Color Tokens">
        <p className="subtitle" style={{ marginTop: 0 }}>
          CSS color variables defined in src/styles/main.scss.
        </p>
        {colorGroups.map((group) => (
          <ColorSection key={group.title} {...group} />
        ))}
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Primary')).toBeVisible();
    await expect(canvas.getByText('var(--primary)')).toBeVisible();
  },
};
