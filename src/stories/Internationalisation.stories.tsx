import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { createMessages, getDocumentLocale, getRouteViewLabel, SUPPORTED_LOCALES } from '../lib/i18n';
import type { Messages } from '../lib/i18n';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const localeRows = SUPPORTED_LOCALES.map((locale) => {
  const messages = createMessages(locale);

  return {
    locale,
    documentLocale: getDocumentLocale(locale),
    label: messages.localeOptions[locale],
    messages,
  };
});

const samplePaths = [
  'app.title',
  'nav.editList',
  'nav.route',
  'nav.settings',
  'pages.edit.pasteLabel',
  'pages.route.subtitle',
  'pages.settings.countryLabel',
  'labels.measurementMode',
  'actions.createSharedLink',
  'pwaInstall.unavailableDescription',
] as const;

const valueAtPath = (messages: Messages, path: string): string =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, messages) as string;

const flattenMessageKeys = (value: unknown, prefix = ''): string[] => {
  if (typeof value === 'string') return [prefix];
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, child]) =>
    flattenMessageKeys(child, prefix ? `${prefix}.${key}` : key),
  );
};

const englishKeys = new Set(flattenMessageKeys(createMessages('en')));

const localeStats = localeRows.map(({ locale, messages }) => {
  const keys = flattenMessageKeys(messages);
  const missingKeys = [...englishKeys].filter((key) => !keys.includes(key));
  const strings = keys.map((key) => valueAtPath(messages, key)).filter((value) => typeof value === 'string');
  const longest = strings.reduce((current, value) => (value.length > current.length ? value : current), '');

  return {
    locale,
    keyCount: keys.length,
    missingKeys,
    longest,
  };
});

const meta = {
  title: 'Design System/Internationalisation',
  parameters: {
    docs: {
      description: {
        component:
          'Locale reference for checking supported languages, document language codes, common UI copy, and long translated strings.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Internationalisation'}>
        <p className={'subtitle'} style={{ marginTop: 0 }}>
          Runtime locale bundles are compared against English by unit tests. This page is for visual checks:
          labels, common navigation copy, document language codes, and strings that may wrap awkwardly.
        </p>
        <div className={'table-wrap'}>
          <table className={'debug-table'}>
            <thead>
              <tr>
                <th>Locale</th>
                <th>Document lang</th>
                <th>Native label</th>
                <th>App title</th>
                <th>Default route label</th>
                <th>Compact route label</th>
              </tr>
            </thead>
            <tbody>
              {localeRows.map(({ locale, documentLocale, label, messages }) => (
                <tr key={locale}>
                  <td>{locale}</td>
                  <td>{documentLocale}</td>
                  <td>{label}</td>
                  <td>{messages.app.title}</td>
                  <td>{getRouteViewLabel('default', messages)}</td>
                  <td>{getRouteViewLabel('compact', messages)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StorySection>

      <StorySection title={'Common UI copy'}>
        <div className={'table-wrap'}>
          <table className={'debug-table'}>
            <thead>
              <tr>
                <th>Key</th>
                {localeRows.map(({ locale }) => (
                  <th key={locale}>{locale}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samplePaths.map((path) => (
                <tr key={path}>
                  <td>{path}</td>
                  {localeRows.map(({ locale, messages }) => (
                    <td key={`${locale}-${path}`}>{valueAtPath(messages, path)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StorySection>

      <StorySection title={'Bundle health'}>
        <div className={'table-wrap'}>
          <table className={'debug-table'}>
            <thead>
              <tr>
                <th>Locale</th>
                <th>String keys</th>
                <th>Missing English keys</th>
                <th>Longest string</th>
              </tr>
            </thead>
            <tbody>
              {localeStats.map(({ locale, keyCount, missingKeys, longest }) => (
                <tr key={locale}>
                  <td>{locale}</td>
                  <td>{keyCount}</td>
                  <td>{missingKeys.length === 0 ? 'None' : missingKeys.join(', ')}</td>
                  <td>{longest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Internationalisation')).toBeVisible();
    await expect(canvas.getByText('en-GB')).toBeVisible();
    await expect(canvas.getByText('en-x-pirate')).toBeVisible();
    await expect(canvas.getByText('Common UI copy')).toBeVisible();
    await expect(canvas.getAllByText('None')[0]).toBeVisible();
  },
};
