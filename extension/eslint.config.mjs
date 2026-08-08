import tailwindCanonicalClasses from 'eslint-plugin-tailwind-canonical-classes';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['node_modules/**', '.output/**', '.wxt/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: tailwindCanonicalClasses.configs['flat/recommended'][0].plugins,
    rules: {
      'tailwind-canonical-classes/tailwind-canonical-classes': [
        'warn',
        {
          cssPath: './assets/globals.css',
          calleeFunctions: ['cn', 'clsx'],
        },
      ],
    },
  },
];