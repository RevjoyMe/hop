import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

import nodePlugin from 'eslint-plugin-n'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  nodePlugin.configs['flat/recommended-script'],
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      unusedImports,
      '@stylistic': stylistic
    },
    rules: {
      /**
       * Explicit off
       */
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      'camelcase': 'off',
      'no-unreachable-loop': 'off',
      'no-unused-vars': 'off',

      /**
       * Explicit warn
       */
      // Can be removed if verbatimModuleSyntax is set for all packages
      'unusedImports/no-unused-imports': 'warn',

      /**
       * Explicit error
       */
      'array-callback-return': 'error',
      'block-scoped-var': 'error',
      'dot-notation': 'error',
      'new-cap': ['error', { 'properties': false }], // Used by ethers event filters
      'no-empty': ['error', { 'allowEmptyCatch': true }],
      'no-new': 'error',
      'prefer-const': ['error', { 'destructuring': 'all' }],
      'no-constructor-return': 'error',
      'no-self-compare': 'error',
      'no-extra-bind': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error',
      // Note: for @typescript-eslint/return-await', you must disable the base rule as it can report incorrect errors
      'no-return-await': 'off',
      '@typescript-eslint/return-await': 'error',
      // Eslint deprecated style rules in favor of formatters. Some rules now --fix with a semicolon.
      // This rule removes the semicolon.
      // https://eslint.style/guide/why
      '@stylistic/semi': ['error', 'never', { 'beforeStatementContinuationChars': 'never'}],
      'no-constant-condition': ['error', { 'checkLoops': false }],

      /**
       * Custom
       */
      // These allow `any`. Remove over time as codebase is cleaned up
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Set to 'warn' or 'error over time as codebase is cleaned up. Possibly add options
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      // Nice to have but need to clean up first
      '@typescript-eslint/no-unnecessary-condition': 'off',
      // Remove when ethers v6 is used and we do not import entire ethers paths
      // Remove when asn1.js is updated to modern package
      'n/no-missing-import': ['error', { 'allowModules': [ 'ethers', 'asn1.js' ] }],
      // Remove when ethers v6 is used and we do not import entire ethers paths
      // Remove when plugin supports workspaces
      // https://github.com/eslint-community/eslint-plugin-n/issues/209
      'n/no-extraneous-import': ['error', {
        'allowModules': [
          '@ethersproject/abstract',
          '@ethersproject/abstract-provider',
          '@ethersproject/bignumber',
          '@ethersproject/contracts',
          '@ethersproject/networks',
          '@ethersproject/properties',
          '@ethersproject/web',
          'typescript-eslint'
        ]
      }],
      // Remove when we have more graceful shutdown logic
      'n/no-process-exit': 'off',
    },
    // Explicitly include all files that should be linted
    files: [
      '**/*.{ts,mts,cts,tsx}',
      'eslint.config.mjs',
      'jest.config.mjs'
    ]
  },
  // Official recommendation is to have a separate object with ignores
  // https://github.com/eslint/eslint/issues/17400#issuecomment-1646543502
  {
    // Ignore all files that are not TS except for lint and jest config.
    // This is needed since .js files are included by default.
    ignores: [
      '**/*.{js,mjs,cjs,jsx,d.ts}',
      '!eslint.config.mjs',
      '!jest.config.mjs'
    ]
  }
)
