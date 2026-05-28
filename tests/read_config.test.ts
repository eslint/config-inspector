import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import nodeModule from 'node:module'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'
import { afterEach, describe, expect, it } from 'vitest'
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

  it('tracks imported files as dependencies for the watcher (#265)', async () => {
    const cwd = resolve(fixturesDir, 'imports')

    const result = await readConfig({
      cwd,
      userConfigPath: 'eslint.config.js',
      chdir: false,
    })

    const configPath = resolve(cwd, 'eslint.config.js')
    const sharedPath = resolve(cwd, 'shared.js')

    expect(result.dependencies).toContain(configPath)
    expect(result.dependencies).toContain(sharedPath)
    expect(result.dependencies.every(d => !d.includes('/node_modules/'))).toBe(true)
  })

  describe('hot-reload of imported config files (#265)', () => {
    const tmpDirs: string[] = []
    afterEach(() => {
      while (tmpDirs.length) {
        const dir = tmpDirs.pop()!
        try {
          rmSync(dir, { recursive: true, force: true })
        }
        catch {}
      }
    })

    it.skipIf(typeof nodeModule.registerHooks !== 'function')(
      'picks up edits to a transitively-imported file on the next read',
      async () => {
        const cwd = mkdtempSync(resolve(tmpdir(), 'config-inspector-reload-'))
        tmpDirs.push(cwd)
        writeFileSync(resolve(cwd, 'package.json'), '{"type":"module"}')
        writeFileSync(
          resolve(cwd, 'eslint.config.js'),
          'import { shared } from \'./shared.js\'\nexport default [{ name: \'reload/main\', files: [\'**/*.js\'], rules: shared }]\n',
        )
        writeFileSync(resolve(cwd, 'shared.js'), 'export const shared = { \'no-console\': \'warn\' }\n')

        const first = await readConfig({ cwd, userConfigPath: 'eslint.config.js', chdir: false, globMatchedFiles: false })
        const firstRules = first.configs.find(cfg => cfg.name === 'reload/main')?.rules
        expect(firstRules).toEqual({ 'no-console': 'warn' })

        writeFileSync(resolve(cwd, 'shared.js'), 'export const shared = { \'no-console\': \'error\' }\n')

        const second = await readConfig({ cwd, userConfigPath: 'eslint.config.js', chdir: false, globMatchedFiles: false })
        const secondRules = second.configs.find(cfg => cfg.name === 'reload/main')?.rules
        expect(secondRules).toEqual({ 'no-console': 'error' })
      },
    )
  })
})
