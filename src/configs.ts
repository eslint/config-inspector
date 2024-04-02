import fs from 'node:fs'
import process from 'node:process'
import { resolve } from 'node:path'
import { bundleRequire } from 'bundle-require'
import type { Linter } from 'eslint'
import fg from 'fast-glob'
import type { Payload, RuleInfo } from '../types'

const configFilenames = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

export async function readConfig(
  cwd: string,
  configPathOverride = process.env.ESLINT_CONFIG,
): Promise<{ payload: Payload, dependencies: string[] }> {
  const configPath = resolve(cwd, configPathOverride || configFilenames.find(i => fs.existsSync(resolve(cwd, i))) || configFilenames[0])

  const { mod, dependencies } = await bundleRequire({
    filepath: configPath,
  })

  const rawConfigs = await (mod.default ?? mod) as Linter.FlatConfig[]

  const rulesMap = new Map<string, RuleInfo>()
  const eslintRules = await import(['eslint', 'use-at-your-own-risk'].join('/')).then(r => r.default.builtinRules)

  for (const [name, rule] of eslintRules.entries()) {
    rulesMap.set(name, {
      ...(rule as any).meta as any,
      name,
      plugin: 'eslint',
      schema: undefined,
      messages: undefined,
    })
  }

  for (const item of rawConfigs) {
    for (const [prefix, plugin] of Object.entries(item.plugins ?? {})) {
      for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
        rulesMap.set(`${prefix}/${name}`, {
          ...(rule as any).meta as any,
          name: `${prefix}/${name}`,
          plugin: prefix,
          schema: undefined,
          messages: undefined,
        })
      }
    }
  }

  const rules = Object.fromEntries(rulesMap.entries())
  const configs = rawConfigs.map((c): Linter.FlatConfig => {
    return {
      ...c,
      plugins: c.plugins
        ? Object.fromEntries(Object.entries(c.plugins ?? {}).map(([prefix]) => [prefix, {}]))
        : undefined,
      languageOptions: c.languageOptions
        ? { ...c.languageOptions, parser: c.languageOptions.parser?.meta?.name as any }
        : undefined,
      processor: (c.processor as any)?.meta?.name,
    }
  })

  const files = await fg(
    configs.flatMap(i => i.files ?? []).filter(i => typeof i === 'string') as string[],
    {
      cwd,
      onlyFiles: true,
      ignore: [
        '**/node_modules/**',
        ...configs.flatMap(i => i.ignores ?? []).filter(i => typeof i === 'string') as string[],
      ],
      deep: 5,
    },
  )

  const payload: Payload = {
    configs,
    rules,
    files,
    meta: {
      lastUpdate: Date.now(),
      configPath,
    },
  }

  return {
    dependencies,
    payload,
  }
}
