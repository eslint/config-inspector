import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'
import { describe, expect, it } from 'vitest'
import { readConfig } from '../src/configs'

const fixturesDir = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures')

describe('readConfig', () => {
  it('resolves a Promise-like default export (e.g. FlatConfigComposer)', async () => {
    const cwd = resolve(fixturesDir, 'composer')

    const result = await readConfig({
      cwd,
      userConfigPath: 'eslint.config.js',
      chdir: false,
    })

    const userConfig = result.configs.find(c => c.name === 'composer/all')
    expect(userConfig, 'composer fixture should be unwrapped into its config array').toBeDefined()

    for (const config of result.configs)
      expect(Object.keys(config)).not.toContain('_operations')
  })
})
