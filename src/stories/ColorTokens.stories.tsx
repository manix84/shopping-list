import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
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

function colorValueToCssVariable(value: string) {
  return value.replace(/^var\((--.+)\)$/, '$1');
}

function formatResolvedColor(color: string) {
  const match = color.match(/^rgba?\(([^)]+)\)$/);

  if (!match) { return color; }

  const [red, green, blue, alpha = '1'] = match[1].split(',').map((part) => part.trim());
  const alphaValue = Number(alpha);

  if (alphaValue < 1) {
    return `rgba(${red}, ${green}, ${blue}, ${alphaValue})`;
  }

  return `#${[red, green, blue]
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function ColorSwatch({ groupTitle, name, value }: { groupTitle: string; name: string; value: string }) {
  const swatchRef = useRef<HTMLDivElement>(null);
  const [resolvedValue, setResolvedValue] = useState(value);
  const cssVariable = colorValueToCssVariable(value);

  useEffect(() => {
    if (!swatchRef.current) { return; }

    setResolvedValue(formatResolvedColor(window.getComputedStyle(swatchRef.current).backgroundColor));
  }, [value]);

  return (
    <article className={'color-token-card'}>
      <div
        ref={swatchRef}
        aria-hidden={'true'}
        className={'color-token-preview'}
        style={{ '--color-token-value': value } as CSSProperties}
      />
      <div className={'color-token-content'}>
        <h4 className={'color-token-name'}>{name}</h4>
        <dl className={'color-token-details'}>
          <div className={'color-token-detail color-token-detail-stacked'}>
            <dt>CSS Variable</dt>
            <dd className={'color-token-variable'}>{cssVariable}</dd>
          </div>
          <div className={'color-token-detail'}>
            <dt>Value</dt>
            <dd>{resolvedValue}</dd>
          </div>
        </dl>
      </div>
      <span className={'sr-only'}>{groupTitle}</span>
    </article>
  );
}

function ColorSection({ title, subtitle, colors }: ColorGroup) {
  return (
    <section className={'color-token-section'}>
      <h3 className={'title title-xs'} style={{ margin: '0 0 0.25rem' }}>
        {title}
      </h3>
      {subtitle && <p className={'subtitle'}>{subtitle}</p>}
      <div className={'color-token-grid'}>
        {Object.entries(colors).map(([name, value]) => (
          <ColorSwatch key={`${title}-${name}`} groupTitle={title} name={name} value={value} />
        ))}
      </div>
    </section>
  );
}

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Color Tokens'}>
        <p className={'subtitle'} style={{ marginTop: 0 }}>
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
    await expect(canvas.getByText('--primary')).toBeVisible();
  },
};
