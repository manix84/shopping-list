import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(rootDir, '..');

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        react: join(packageRoot, 'node_modules/react'),
        'react-dom': join(packageRoot, 'node_modules/react-dom'),
        'react/jsx-runtime': join(packageRoot, 'node_modules/react/jsx-runtime.js'),
      },
      dedupe: [...(config.resolve?.dedupe ?? []), 'react', 'react-dom'],
    },
    optimizeDeps: {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include ?? []), 'react', 'react-dom', 'react/jsx-runtime'],
      exclude: [...(config.optimizeDeps?.exclude ?? []), '@mdx-js/react'],
    },
  }),
};

export default config;
