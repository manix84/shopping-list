import React from 'react';
import { MoonIcon, SunIcon } from '@storybook/icons';
import { addons, types, useGlobals } from 'storybook/manager-api';
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

function ThemeToggleTool() {
  const [globals, updateGlobals] = useGlobals();
  const theme = resolveTheme(globals.theme);
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} mode`;
  const Icon = theme === 'dark' ? SunIcon : MoonIcon;

  return React.createElement(
    'button',
    {
      type: 'button',
      active: theme === 'dark',
      'aria-label': label,
      title: label,
      style: {
        alignItems: 'center',
        background: theme === 'dark' ? 'rgba(79, 140, 255, 0.16)' : 'transparent',
        border: 0,
        borderRadius: 4,
        color: 'inherit',
        cursor: 'pointer',
        display: 'inline-flex',
        gap: 6,
        height: 32,
        lineHeight: 1,
        paddingInline: 8,
      },
      onClick: () => updateGlobals({ theme: nextTheme }),
    },
    React.createElement(Icon),
    React.createElement('span', { style: { fontSize: 12, fontWeight: 600 } }, 'Theme')
  );
}

setManagerTheme('light');

addons.register('shopping-list/theme-sync', (api) => {
  const syncManagerTheme = (payload?: GlobalsUpdatedPayload) => {
    setManagerTheme(resolveTheme(payload?.globals?.theme ?? api.getGlobals().theme));
  };

  syncManagerTheme();
  api.on(GLOBALS_UPDATED, syncManagerTheme);

  addons.add('shopping-list/theme-toggle', {
    title: 'Theme',
    type: types.TOOL,
    render: () => React.createElement(ThemeToggleTool),
  });
});
