import c from 'ansis'

export const configFilenames = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

export const legacyConfigFilenames = [
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  '.eslintrc.json',
]

export const MARK_CHECK = c.green('✔')
export const MARK_INFO = c.blue('ℹ')
export const MARK_ERROR = c.red('✖')
