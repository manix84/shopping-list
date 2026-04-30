import type { Preview } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import type {} from './storybook-env';
import { useEffect } from 'react';
import { createMessages, I18nProvider } from '../src/lib/i18n';
import '../src/styles/main.scss';

const locale = 'en';
const messages = createMessages(locale);
type StorybookTheme = 'light' | 'dark';

function ThemeDecorator({ theme, children }: { theme: StorybookTheme; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = theme === 'dark' ? '#0b1220' : '#f6f7fb';
    }
  }, [theme]);

  return children;
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as StorybookTheme;

      return (
        <ThemeDecorator theme={theme}>
          <I18nProvider value={{ locale, messages, setLocale: () => undefined }}>
            <Story />
          </I18nProvider>
        </ThemeDecorator>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'App color theme',
      defaultValue: 'light',
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    backgrounds: {
      disable: true,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    layout: 'fullscreen',

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
