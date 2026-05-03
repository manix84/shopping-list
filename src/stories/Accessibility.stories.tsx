import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const checklist = [
  {
    area: 'Keyboard',
    expectation: 'Every interactive control is reachable, visibly focused, and usable without pointer input.',
    examples: 'Skip link, route toolbar, debug tabs, modal close buttons.',
  },
  {
    area: 'Names',
    expectation: 'Icon-only buttons have an accessible name and a visible tooltip/title where useful.',
    examples: 'Mobile navigation, filter, measurement mode, PWA dismiss, QR actions.',
  },
  {
    area: 'Status',
    expectation: 'Async or transient state changes are announced without stealing focus.',
    examples: 'Backend badge, share-link validation, QR scanner status, PWA splash.',
  },
  {
    area: 'Structure',
    expectation: 'Pages use landmarks, labelled navigation, headings, groups, tabs, and dialogs deliberately.',
    examples: 'App header navigation, debug tablist, scanner dialog, route section cards.',
  },
  {
    area: 'Text',
    expectation: 'UI copy must survive long translations, mobile widths, and browser text scaling.',
    examples: 'Internationalisation story, route header, shared-list history, install banner.',
  },
  {
    area: 'Contrast',
    expectation: 'Light and dark themes keep text, focus rings, badges, controls, and disabled states legible.',
    examples: 'Color tokens, buttons, inputs, connection status, empty states.',
  },
];

const meta = {
  title: 'Design System/Accessibility',
  parameters: {
    docs: {
      description: {
        component:
          'Accessibility guidance for the app shell, shared controls, interaction states, and release checks.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title="Accessibility">
        <p className="subtitle" style={{ marginTop: 0 }}>
          Accessibility is treated as part of the component contract. New UI should preserve keyboard access,
          meaningful names, visible focus, announced state changes, and readable translated text.
        </p>
        <div className="table-wrap">
          <table className="debug-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Expectation</th>
                <th>Examples to check</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item) => (
                <tr key={item.area}>
                  <td>{item.area}</td>
                  <td>{item.expectation}</td>
                  <td>{item.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StorySection>

      <StorySection title="Keyboard and focus">
        <a className="skip-link" href="#storybook-accessibility-demo">
          Skip to demo content
        </a>
        <div className="button-row" aria-label="Example controls">
          <button type="button" className="button button-primary">
            Primary action
          </button>
          <button type="button" className="button">
            Secondary action
          </button>
          <button type="button" className="button button-danger">
            Dangerous action
          </button>
        </div>
        <div id="storybook-accessibility-demo" className="empty-state" tabIndex={-1}>
          Focus should remain visible on controls, and skip links should become visible only when focused.
        </div>
      </StorySection>

      <StorySection title="Announcements">
        <div className="small-text" role="status" aria-live="polite">
          Polite status updates announce save, sync, scan, install, and validation changes without interrupting the
          current task.
        </div>
        <div className="small-text" role="alert">
          Alerts are reserved for errors that need attention before the user can continue.
        </div>
      </StorySection>

      <StorySection title="Release checks">
        <p className="subtitle" style={{ marginTop: 0 }}>
          Storybook interaction tests catch role/name regressions. Lighthouse is the release gate for accessibility
          scoring, with the dedicated accessibility workflow requiring a full accessibility score.
        </p>
        <pre className="color-token-variable" aria-label="Accessibility release commands">
          npm run test:storybook{'\n'}npm run lighthouse
        </pre>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Accessibility')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /primary action/i })).toBeVisible();
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(canvas.getByRole('alert')).toBeVisible();

    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: /skip to demo content/i })).toHaveFocus();
  },
};
