import { basename, dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { ConfigArray } from '@eslint/config-array'
import { configArrayFindFiles } from '@voxpelli/config-array-find-files'
import { bundleRequire } from 'bundle-require'
import { findUp } from 'find-up'
import c from 'picocolors'
import { resolve as resolveModule } from 'mlly'
import type { FlatConfigItem, MatchedFile, Payload, RuleInfo } from '../shared/types'
import { isIgnoreOnlyConfig, matchFile } from '../shared/configs'
import { MARK_CHECK, MARK_INFO, configFilenames, legacyConfigFilenames } from './constants'
import { ConfigPathError, ConfigPathLegacyError } from './errors'

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

  const lookupBasePath = userBasePath || cwd

  let configPath = userConfigPath && resolve(cwd, userConfigPath)

  if (!configPath) {
    configPath = await findUp(configFilenames, { cwd: lookupBasePath })
  }

  if (!configPath) {
    const legacyConfigPath = await findUp(legacyConfigFilenames, { cwd: lookupBasePath })

    throw legacyConfigPath
      ? new ConfigPathLegacyError(
        `${relative(cwd, dirname(legacyConfigPath))}/`,
        basename(legacyConfigPath),
      )
      : new ConfigPathError(
        `${relative(cwd, lookupBasePath)}/`,
        configFilenames,
      )
  }

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

export interface ESLintConfig {
  configs: FlatConfigItem[]
  payload: Payload
  dependencies: string[]
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
): Promise<ESLintConfig> {
  const {
    chdir = true,
    globMatchedFiles: globFiles = true,
  } = options

  const resolvedConfigPath = await resolveConfigPath(options)

  const { basePath, configPath } = resolvedConfigPath
  if (chdir && basePath !== process.cwd())
    process.chdir(basePath)

  console.log(MARK_INFO, `Reading ESLint config from`, c.blue(configPath))
  const { mod, dependencies } = await bundleRequire({
    filepath: configPath,
    cwd: basePath,
    tsconfig: false,
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

const noopSchema = {
  merge: 'replace',
  validate() {},
}

const flatConfigNoopSchema = {
  settings: noopSchema,
  linterOptions: noopSchema,
  language: noopSchema,
  languageOptions: noopSchema,
  processor: noopSchema,
  plugins: noopSchema,
  rules: noopSchema,
}

export async function globMatchedFiles(
  basePath: string,
  configs: FlatConfigItem[],
): Promise<MatchedFile[]> {
  console.log(MARK_INFO, 'Globing matched files')

  const configArray = new ConfigArray(configs, {
    basePath,
    schema: flatConfigNoopSchema,
  })

  await configArray.normalize()

  const files = await configArrayFindFiles({
    basePath,
    configs: configArray,
  })

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
      filepath = relative(basePath, filepath)
      const result = matchFile(filepath, configs, ignoreOnlyConfigs)
      if (!result.configs.length)
        return undefined
      return result
    })
    .filter(i => i) as MatchedFile[]
}
