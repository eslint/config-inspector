import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { bundleRequire } from 'bundle-require'
import fg from 'fast-glob'
import { findUp } from 'find-up'
import c from 'picocolors'
import { resolve as resolveModule } from 'mlly'
import type { FlatConfigItem, MatchedFile, Payload, RuleInfo } from '../shared/types'
import { isIgnoreOnlyConfig, matchFile } from '../shared/configs'
import { MARK_CHECK, MARK_INFO, configFilenames } from './constants'

export interface ReadConfigOptions extends ResolveConfigPathOptions {
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

export interface ResolveConfigPathOptions {
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
}

/**
 * Search and read the ESLint config file.
 *
 * Accept an options object to specify the working directory path and overrides.
 */
export async function resolveConfigPath(options: ResolveConfigPathOptions) {
  let {
    cwd,
    userConfigPath,
    userBasePath,
  } = options

  if (userBasePath)
    userBasePath = resolve(cwd, userBasePath)

  const configPath = userConfigPath
    ? resolve(cwd, userConfigPath)
    : await findUp(configFilenames, { cwd: userBasePath || cwd })

  if (!configPath)
    throw new Error('Cannot find ESLint config file')

  const basePath = userBasePath || (
    userConfigPath
      ? cwd // When user explicit provide config path, use current working directory as root
      : dirname(configPath) // Otherwise, use config file's directory as root
  )
  return {
    basePath,
    configPath,
  }
}

/**
 * Search and read the ESLint config file, processed into inspector payload with module dependencies
 *
 * Accept an options object to specify the working directory path and overrides.
 *
 * It uses `bundle-requires` load the config file and find it's dependencies.
 * It always get the latest version of the config file (no ESM cache).
 */
export async function readConfig(
  options: ReadConfigOptions,
): Promise<{ configs: FlatConfigItem[], payload: Payload, dependencies: string[] }> {
  const {
    chdir = true,
    globMatchedFiles: globFiles = true,
  } = options

  const { basePath, configPath } = await resolveConfigPath(options)
  if (chdir && basePath !== process.cwd())
    process.chdir(basePath)

  console.log(MARK_INFO, `Reading ESLint config from`, c.blue(configPath))
  const { mod, dependencies } = await bundleRequire({
    filepath: configPath,
    cwd: basePath,
  })

  let rawConfigs = await (mod.default ?? mod) as FlatConfigItem[]

  // A single flat config object is also valid
  if (!Array.isArray(rawConfigs))
    rawConfigs = [rawConfigs]

  // ESLint applies these default configs to all files
  // https://github.com/eslint/eslint/blob/21d3766c3f4efd981d3cc294c2c82c8014815e6e/lib/config/default-config.js#L66-L69
  rawConfigs.unshift(
    {
      name: 'eslint/defaults/languages',
      languageOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        parserOptions: {},
      },
      linterOptions: {
        reportUnusedDisableDirectives: 1,
      },
    } as FlatConfigItem,
    {
      name: 'eslint/defaults/ignores',
      ignores: [
        '**/node_modules/',
        '.git/',
      ],
    } as FlatConfigItem,
    {
      name: 'eslint/defaults/files',
      files: ['**/*.js', '**/*.mjs'],
    } as FlatConfigItem,
    {
      name: 'eslint/defaults/files-cjs',
      files: ['**/*.cjs'],
      languageOptions: {
        sourceType: 'commonjs',
        ecmaVersion: 'latest',
      },
    } as FlatConfigItem,
  )

  const rulesMap = new Map<string, RuleInfo>()

  // Try resolve `eslint` module from the same directory as the config file
  // Otherwise fallback to bare import
  const eslintPath = await resolveModule('eslint/use-at-your-own-risk', { url: basePath })
    .catch(() => null) || 'eslint/use-at-your-own-risk'
  const eslintRules = await import(eslintPath).then(r => r.default.builtinRules)

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
  const configs = rawConfigs.map((c, idx): FlatConfigItem => {
    return {
      ...c,
      index: idx,
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
      ? await globMatchedFiles(basePath, rawConfigs)
      : undefined,
    meta: {
      lastUpdate: Date.now(),
      basePath,
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
  basePath: string,
  configs: FlatConfigItem[],
): Promise<MatchedFile[]> {
  console.log(MARK_INFO, 'Globing matched files')
  const files = await fg(
    configs.flatMap(i => i.files ?? []).filter(i => typeof i === 'string') as string[],
    {
      cwd: basePath,
      onlyFiles: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        ...configs
          .filter(i => isIgnoreOnlyConfig(i))
          .flatMap(i => i.ignores ?? [])
          .filter(i => typeof i === 'string') as string[],
      ],
      deep: 5, // TODO: maybe increase this?
    },
  )
  files.sort()

  const ignoreOnlyConfigs = configs.filter(isIgnoreOnlyConfig)
  // const functionalGlobMap = new Map<any, string>()
  // function stringifyGlob(glob: string) {
  //   if (typeof glob === 'function') {
  //     if (!functionalGlobMap.has(glob))
  //       functionalGlobMap.set(glob, `<function#${functionalGlobMap.size + 1}>`)
  //     return functionalGlobMap.get(glob)!
  //   }
  //   return glob
  // }

  return files
    .map((filepath) => {
      const result = matchFile(filepath, configs, ignoreOnlyConfigs)
      if (!result.configs.length)
        return undefined
      return result
    })
    .filter(i => i) as MatchedFile[]
}
