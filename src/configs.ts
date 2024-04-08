import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { bundleRequire } from 'bundle-require'
import type { Linter } from 'eslint'
import fg from 'fast-glob'
import { findUp } from 'find-up'
import c from 'picocolors'
import type { FlatESLintConfigItem, Payload, RuleInfo } from '../shared/types'
import { isIgnoreOnlyConfig } from '../shared/configs'
import { MARK_CHECK, MARK_INFO, configFilenames } from './constants'

export interface ReadConfigOptions {
  /**
   * Current working directory
   */
  cwd: string
  /**
   * Override config file path.
   * When not provided, will try to find config file in current working directory or userBasePath if provided.
   */
  userConfigPath?: string
  /**
   * Override base path. When not provided, will use directory of discovered config file.
   */
  userBasePath?: string
  /**
   * Glob file paths matched by the configs
   *
   * @default true
   */
  globMatchedFiles?: boolean
  /**
   * Change current working directory to basePath
   * @default true
   */
  chdir?: boolean
}

/**
 * Search and read the ESLint config file, processed into inspector payload with module dependencies
 *
 * Accpet an options object to specify the working directory path and overrides.
 *
 * It uses `bundle-requires` load the config file and find it's dependencies.
 * It always get the latest version of the config file (no ESM cache).
 */
export async function readConfig(
  {
    cwd,
    userConfigPath,
    userBasePath,
    chdir = true,
    globMatchedFiles: globFiles = true,
  }: ReadConfigOptions,
): Promise<{ configs: FlatESLintConfigItem[], payload: Payload, dependencies: string[] }> {
  if (userBasePath)
    userBasePath = resolve(cwd, userBasePath)

  const configPath = userConfigPath
    ? resolve(cwd, userConfigPath)
    : await findUp(configFilenames, { cwd: userBasePath || cwd })

  if (!configPath)
    throw new Error('Cannot find ESLint config file')

  const rootPath = userBasePath || (
    userConfigPath
      ? cwd // When user explicit provide config path, use current working directory as root
      : dirname(configPath) // Otherwise, use config file's directory as root
  )

  if (chdir && rootPath !== process.cwd())
    process.chdir(rootPath)

  console.log(MARK_INFO, `Reading ESLint config from`, c.blue(configPath))
  const { mod, dependencies } = await bundleRequire({
    filepath: configPath,
    cwd: rootPath,
  })

  const rawConfigs = await (mod.default ?? mod) as FlatESLintConfigItem[]

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

  console.log(MARK_CHECK, 'Loaded with', configs.length, 'config items and', Object.keys(rules).length, 'rules')

  const payload: Payload = {
    configs,
    rules,
    files: globFiles
      ? await globMatchedFiles(rootPath, configs)
      : undefined,
    meta: {
      lastUpdate: Date.now(),
      rootPath,
      configPath,
    },
  }

  return {
    configs: rawConfigs,
    dependencies,
    payload,
  }
}

export async function globMatchedFiles(
  rootPath: string,
  configs: FlatESLintConfigItem[],
): Promise<string[]> {
  console.log(MARK_INFO, 'Globing matched files')
  const files = await fg(
    configs.flatMap(i => i.files ?? []).filter(i => typeof i === 'string') as string[],
    {
      cwd: rootPath,
      onlyFiles: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        ...configs
          .filter(i => isIgnoreOnlyConfig(i))
          .flatMap(i => i.files ?? [])
          .filter(i => typeof i === 'string') as string[],
      ],
      deep: 5,
    },
  )
  files.sort()
  console.log(MARK_CHECK, 'Found', files.length, 'matched files by configs')
  return files
}
