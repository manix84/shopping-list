// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const quoteAsSingleQuotedString = (value) =>
  `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')}'`;

const localRules = {
  'jsx-attribute-curly-braces': {
    meta: {
      type: 'layout',
      fixable: 'code',
      schema: [],
      messages: {
        wrapAttribute: 'Wrap JSX string attribute values in curly braces.',
      },
    },
    create(context) {
      return {
        JSXAttribute(node) {
          if (!node.value || node.value.type !== 'Literal' || typeof node.value.value !== 'string') { return; }

          context.report({
            node: node.value,
            messageId: 'wrapAttribute',
            fix(fixer) {
              return fixer.replaceText(node.value, `{${quoteAsSingleQuotedString(node.value.value)}}`);
            },
          });
        },
      };
    },
  },
};

export default tseslint.config({
  ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'public/**', 'storybook-static/**', 'vite.config.d.ts'],
}, js.configs.recommended, ...tseslint.configs.recommended, {
  files: ['**/*.{js,mjs,cjs,ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  plugins: {
    local: {
      rules: localRules,
    },
  },
  rules: {
    quotes: [
      'error',
      'single',
      { allowTemplateLiterals: true, avoidEscape: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': 'warn',
    'block-spacing': ['error', 'always'],
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'local/jsx-attribute-curly-braces': 'error',
    'no-console': 'off',
    'space-before-blocks': ['error', 'always'],
  },
}, {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/**/*.test.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../server/*', '../../server/*', '../../../server/*'],
            message: 'Frontend source should not import server modules. Keep shared contracts in src/ or types.',
          },
        ],
      },
    ],
  },
}, {
  files: ['vite.config.ts'],
  languageOptions: {
    globals: globals.node,
  },
}, storybook.configs['flat/recommended']);
