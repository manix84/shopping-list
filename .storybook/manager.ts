import { addons } from 'storybook/manager-api';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { create } from 'storybook/theming';

type StorybookTheme = 'light' | 'dark';
interface GlobalsUpdatedPayload {
  globals?: Record<string, unknown>;
}

const brand = {
  brandTitle: 'Smart Shopping List',
  brandUrl: '/',
  brandTarget: '_self',
};

const themes = {
  light: create({
    base: 'light',
    ...brand,
    brandImage: '/storybook-logo.png',
  }),
  dark: create({
    base: 'dark',
    ...brand,
    brandImage: '/storybook-logo-dark.png',
  }),
};

function setManagerTheme(theme: StorybookTheme) {
  addons.setConfig({
    theme: themes[theme],
  });
}

function resolveTheme(value: unknown): StorybookTheme {
  return value === 'dark' ? 'dark' : 'light';
}

setManagerTheme('light');

addons.register('shopping-list/theme-sync', (api) => {
  const syncManagerTheme = (payload?: GlobalsUpdatedPayload) => {
    setManagerTheme(resolveTheme(payload?.globals?.theme ?? api.getGlobals().theme));
  };

  syncManagerTheme();
  api.on(GLOBALS_UPDATED, syncManagerTheme);
});
