import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const palette = [
  ['Background', 'var(--bg)'],
  ['Panel', 'var(--panel)'],
  ['Panel alt', 'var(--panel-alt)'],
  ['Border', 'var(--border)'],
  ['Text', 'var(--text)'],
  ['Muted', 'var(--muted)'],
  ['Primary', 'var(--primary)'],
  ['Danger', 'var(--danger)'],
];

const meta = {
  title: 'Design System/Common Pieces',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Reusable visual language that is expressed as app-wide CSS classes rather than dedicated React components.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function StorySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="title title-sm">{title}</h2>
      </div>
      <div className="card-body stack">{children}</div>
    </section>
  );
}

export const Foundations: Story = {
  render: () => (
    <main>
      <div className="shopping-shell" style={{ paddingBlock: 24 }}>
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

        <StorySection title="Color Tokens">
          <div className="stats-grid">
            {palette.map(([label, value]) => (
              <div key={label} className="stat-card">
                <div
                  aria-hidden="true"
                  style={{
                    background: value,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    height: 54,
                    marginBottom: 10,
                  }}
                />
                <div className="stat-label">{label}</div>
                <div className="small-text">{value}</div>
              </div>
            ))}
          </div>
        </StorySection>

        <StorySection title="Actions">
          <div className="button-row">
            <button type="button" className="button button-primary">
              Primary action
            </button>
            <button type="button" className="button">
              Secondary action
            </button>
            <button type="button" className="button button-danger">
              Dangerous action
            </button>
            <button type="button" className="button button-link">
              Link action
            </button>
          </div>
        </StorySection>

        <StorySection title="Forms">
          <div className="field field-compact">
            <label htmlFor="storybook-input">Field label</label>
            <div className="small-text">Helper text explains the expected input.</div>
            <input id="storybook-input" className="input" placeholder="Input text" />
          </div>
          <div className="field field-compact">
            <label htmlFor="storybook-select">Select label</label>
            <select id="storybook-select" className="select" defaultValue="one">
              <option value="one">One option</option>
              <option value="two">Another option</option>
            </select>
          </div>
        </StorySection>

        <StorySection title="Empty States">
          <div className="empty-state">Empty, loading, and unavailable states use this quiet dashed treatment.</div>
        </StorySection>
      </div>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: /page title/i })).toBeVisible();
    await expect(canvas.getByText('Primary')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /primary action/i })).toBeVisible();

    const input = canvas.getByLabelText('Field label');
    await userEvent.type(input, 'Shopping note');
    await expect(input).toHaveValue('Shopping note');

    const select = canvas.getByLabelText('Select label');
    await userEvent.selectOptions(select, 'two');
    await expect(select).toHaveValue('two');
  },
};
