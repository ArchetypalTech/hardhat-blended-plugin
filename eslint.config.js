const recommended = require('@typescript-eslint/eslint-plugin').configs.recommended;
const recommendedTypeChecking = require('@typescript-eslint/eslint-plugin').configs[
  'recommended-requiring-type-checking'
];
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    ignores: [
      '**/node_modules/**',
      '**/artifacts/**',
      '**/cache/**',
      '**/coverage/**',
      '**/typechain/**',
      '**/typechain-types/**',
      'dist/**',
      '**/dist/**',
      'examples/**',
      '**/examples/**',
    ],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2022,
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        it: 'readonly',
        describe: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      ...recommended.rules,
      ...recommendedTypeChecking.rules,
      ...prettier.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      'no-console': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
];
