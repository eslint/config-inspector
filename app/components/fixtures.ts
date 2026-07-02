import type { FlatConfigItem, MatchedFile, Payload, ResolvedPayload, RuleInfo } from '~~/shared/types'
import { resolvePayload } from '~/composables/payload'

/**
 * Static demo payload for Storybook stories and component tests.
 *
 * Mirrors the shape produced by the CLI (`src/configs.ts`) for a small
 * imaginary project, so components that read the shared payload state can be
 * rendered in isolation by seeding it via `setPayload(demoPayload)`.
 */

function defineRule(rule: Partial<RuleInfo> & { name: string, plugin: string }): RuleInfo {
  return rule as RuleInfo
}

const demoRules: Record<string, RuleInfo> = {
  'no-console': defineRule({
    name: 'no-console',
    plugin: '',
    docs: {
      description: 'Disallow the use of `console`',
      url: 'https://eslint.org/docs/latest/rules/no-console',
    },
  }),
  'prefer-const': defineRule({
    name: 'prefer-const',
    plugin: '',
    fixable: 'code',
    docs: {
      description: 'Require `const` declarations for variables that are never reassigned after declared',
      url: 'https://eslint.org/docs/latest/rules/prefer-const',
      recommended: true,
    },
    defaultOptions: [{ destructuring: 'any', ignoreReadBeforeAssign: false }] as any,
  }),
  'no-return-await': defineRule({
    name: 'no-return-await',
    plugin: '',
    docs: {
      description: 'Disallow unnecessary `return await`',
      url: 'https://eslint.org/docs/latest/rules/no-return-await',
    },
    deprecated: {
      message: 'The original assumption of the rule no longer holds true because of engine optimizations.',
      deprecatedSince: '8.46.0',
      url: 'https://eslint.org/docs/latest/rules/no-return-await',
      replacedBy: [
        {
          rule: {
            name: '@typescript-eslint/return-await',
            url: 'https://typescript-eslint.io/rules/return-await/',
          },
          plugin: {
            name: 'typescript-eslint',
            url: 'https://typescript-eslint.io',
          },
        },
      ],
    },
  }),
  '@typescript-eslint/no-explicit-any': defineRule({
    name: '@typescript-eslint/no-explicit-any',
    plugin: '@typescript-eslint',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description: 'Disallow the `any` type',
      url: 'https://typescript-eslint.io/rules/no-explicit-any/',
      recommended: true,
    },
  }),
  'vue/no-v-html': defineRule({
    name: 'vue/no-v-html',
    plugin: 'vue',
    docs: {
      description: 'Disallow use of v-html to prevent XSS attack',
      url: 'https://eslint.vuejs.org/rules/no-v-html.html',
    },
  }),
}

const demoConfigs: FlatConfigItem[] = [
  {
    name: 'demo/setup',
    index: 0,
    plugins: {
      '@typescript-eslint': {},
      'vue': {},
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
    },
  },
  {
    name: 'demo/rules',
    index: 1,
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': ['error', { destructuring: 'any' }],
      'no-return-await': 'error',
    },
  },
  {
    name: 'demo/typescript',
    index: 2,
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'off',
    },
  },
  {
    name: 'demo/vue',
    index: 3,
    files: [['**/*.vue', 'app/**']],
    rules: {
      'vue/no-v-html': 'warn',
    },
  },
  {
    name: 'demo/ignores',
    index: 4,
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
]

const demoFiles: MatchedFile[] = [
  { filepath: 'app/app.vue', globs: [['**/*.vue', 'app/**']], configs: [0, 1, 3] },
  { filepath: 'app/components/NavBar.vue', globs: [['**/*.vue', 'app/**']], configs: [0, 1, 3] },
  { filepath: 'src/cli.ts', globs: ['**/*.ts'], configs: [0, 1, 2] },
  { filepath: 'src/configs.ts', globs: ['**/*.ts'], configs: [0, 1, 2] },
  { filepath: 'README.md', globs: [], configs: [0, 1] },
]

export const demoPayload: Payload = {
  rules: demoRules,
  configs: demoConfigs,
  files: demoFiles,
  meta: {
    lastUpdate: Date.now() - 1000 * 60 * 5,
    basePath: '/demo/project',
    configPath: '/demo/project/eslint.config.js',
  },
}

export const demoResolved: ResolvedPayload = resolvePayload(demoPayload)
