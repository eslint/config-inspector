import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { bundleRequire } from 'bundle-require'
import type { Linter } from 'eslint'
import fg from 'fast-glob'
import { findUp } from 'find-up'
import type { Payload, RuleInfo } from '../types'

const configFilenames = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

export interface ReadConfigOptions {
  cwd: string
  userConfigPath?: string
  userRootPath?: string
  /**
   * Change current working directory to rootPath
   * @default true
   */
  chdir?: boolean
}

export async function readConfig(
  {
    cwd,
    userConfigPath,
    userRootPath,
    chdir = true,
  }: ReadConfigOptions,
): Promise<{ payload: Payload, dependencies: string[] }> {
  if (userRootPath)
    userRootPath = resolve(cwd, userRootPath)

  const configPath = userConfigPath
    ? resolve(cwd, userConfigPath)
    : await findUp(configFilenames, { cwd: userRootPath || cwd })

  if (!configPath)
    throw new Error('Cannot find ESLint config file')

  const rootPath = userRootPath || (
    userConfigPath
      ? cwd // When user explicit provide config path, use current working directory as root
      : dirname(configPath) // Otherwise, use config file's directory as root
  )

  if (chdir && rootPath !== process.cwd())
    process.chdir(rootPath)

  console.log('Reading ESLint configs from', configPath)
  const { mod, dependencies } = await bundleRequire({
    filepath: configPath,
    cwd: rootPath,
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
        ? Object.fromEntries(Object.entries(c.plugins ?? {}).map(([prefix]) => [prefix, {}]).filter(i => i[0]))
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
      cwd: rootPath,
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
      rootPath,
      configPath,
    },
  }

  return {
    dependencies,
    payload,
  }
}
