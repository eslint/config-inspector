export default [
  {
    name: 'basic/all',
    files: ['**/*.{js,ts}'],
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
    },
  },
  {
    name: 'basic/tests',
    files: ['**/*.test.{js,ts}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    name: 'basic/ignores',
    ignores: ['dist/**', 'node_modules/**'],
  },
]
