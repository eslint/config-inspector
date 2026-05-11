import type { ConfigArray } from '@eslint/config-array'
import type { Linter } from 'eslint'
import type { FlatConfigItem, MatchedFile, Payload, RuleInfo } from '../shared/types'
import { statSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import fswalk from '@nodelib/fs.walk'
import c from 'ansis'
import { findUp } from 'find-up'
import { createJiti } from 'jiti'
import { resolve as resolveModule } from 'mlly'
import { basename, dirname, normalize, relative, resolve } from 'pathe'
import { buildConfigArray, matchFile } from '../shared/configs'
import { configFilenames, legacyConfigFilenames, MARK_CHECK, MARK_INFO } from './constants'
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

  const basePath = normalize(userBasePath || (
    userConfigPath
      ? cwd // When user explicit provide config path, use current working directory as root
      : dirname(configPath) // Otherwise, use config file's directory as root
  ))

  configPath = normalize(configPath)

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
 * It uses `jiti` to load the config file (the same loader ESLint itself uses).
 * Each call creates a fresh jiti instance and busts the ESM cache via an
 * `mtime` URL query param, so the latest version of the config is always read.
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
  const jiti = createJiti(import.meta.url, { moduleCache: false })
  const fileURL = pathToFileURL(configPath)
  fileURL.searchParams.set('mtime', String(statSync(configPath).mtimeMs))
  const mod = await jiti.import(fileURL.href)

  const dependencies = collectJitiDependencies(jiti, configPath)

  const exported = ((mod as any)?.default ?? mod) as FlatConfigItem | FlatConfigItem[]

  // A single flat config object is also valid. Always clone into a fresh
  // array so the ESLint defaults `unshift`ed below don't mutate the user's
  // exported array — Node's ESM loader caches modules by URL, so a second
  // load of an unchanged config would otherwise return the same reference
  // and accumulate defaults on each call.
  const rawConfigs: FlatConfigItem[] = Array.isArray(exported) ? [...exported] : [exported]

  // ESLint applies these default configs to all files
  // https://github.com/eslint/eslint/blob/21d3766c3f4efd981d3cc294c2c82c8014815e6e/lib/config/default-config.js#L66-L69
  rawConfigs.unshift(
    {
      index: 1,
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
      index: 2,
      name: 'eslint/defaults/ignores',
      ignores: [
        '**/node_modules/',
        '.git/',
      ],
    } as FlatConfigItem,
    {
      index: 3,
      name: 'eslint/defaults/files',
      files: ['**/*.js', '**/*.mjs'],
    } as FlatConfigItem,
    {
      index: 4,
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
    const out: FlatConfigItem = { ...c, index: idx }
    if (c.plugins)
      out.plugins = Object.fromEntries(Object.entries(c.plugins).map(([prefix]) => [prefix, {}]).filter(i => i[0]))
    else
      delete out.plugins
    if (c.languageOptions)
      out.languageOptions = { ...c.languageOptions, parser: (c.languageOptions.parser as any)?.meta?.name as any }
    else
      delete out.languageOptions
    const processorName = (c.processor as any)?.meta?.name
    if (processorName)
      out.processor = processorName
    else
      delete out.processor
    return out
  })

  console.log(MARK_CHECK, 'Loaded with', configs.length, 'config items and', Object.keys(rules).length, 'rules')

  const payload: Payload = {
    configs,
    rules,
    files: globFiles
      ? await globMatchedFiles(basePath, configs, rawConfigs)
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

/**
 * Best-effort dependency collection from a `jiti` instance's internal module
 * cache, used by the dev-mode watcher to reload when imported files change.
 *
 * jiti 2.x has no public dep-tracking API; we read the `cache` property if it
 * is present and walk its keys. If the shape ever changes, we fall back to
 * watching just the config file, which matches ESLint's own behavior.
 */
function collectJitiDependencies(jiti: unknown, configPath: string): string[] {
  const deps = new Set<string>([configPath])
  const cache = (jiti as { cache?: unknown }).cache
  let keys: string[] = []
  if (cache instanceof Map)
    keys = [...cache.keys()].filter((k): k is string => typeof k === 'string')
  else if (cache && typeof cache === 'object')
    keys = Object.keys(cache as Record<string, unknown>)
  for (const key of keys) {
    const path = key.startsWith('file://') ? fileURLToPath(key) : key
    if (path && !path.includes('/node_modules/'))
      deps.add(path)
  }
  return [...deps]
}

export async function globMatchedFiles(
  basePath: string,
  configs: FlatConfigItem[],
  rawConfigs: Linter.Config[],
): Promise<MatchedFile[]> {
  console.log(MARK_INFO, 'Globbing matched files')

  const files = [
    ...await configArrayFindFiles(basePath, buildConfigArray(rawConfigs, basePath)),
  ].sort()

  return files
    .map((filepath) => {
      filepath = relative(basePath, filepath).replaceAll('\\', '/')
      const result = matchFile(filepath, configs, basePath)
      if (!result.configs.length)
        return undefined
      return result
    })
    .filter(i => i) as MatchedFile[]
}

/**
 * Walk a directory and collect files that match the given config array.
 * Skips directories ignored by the config array, and only keeps files that
 * resolve to a defined config.
 *
 * Adapted from https://github.com/voxpelli/config-array-find-files (MIT, © 2024 Pelle Wessman)
 */
async function configArrayFindFiles(basePath: string, configs: ConfigArray): Promise<string[]> {
  return new Promise((resolvePromise, rejectPromise) => {
    let rejected = false

    function safeFilter(filter: (entry: fswalk.Entry) => boolean) {
      return (entry: fswalk.Entry) => {
        if (rejected)
          return false
        try {
          return filter(entry)
        }
        catch (err) {
          rejected = true
          rejectPromise(err)
          return false
        }
      }
    }

    fswalk.walk(
      basePath,
      {
        deepFilter: safeFilter(entry => !configs.isDirectoryIgnored(entry.path)),
        entryFilter: safeFilter(entry => !entry.dirent.isDirectory() && configs.getConfig(entry.path) !== undefined),
      },
      (error, entries) => {
        if (error)
          rejectPromise(error)
        else
          resolvePromise(entries.map(e => e.path))
      },
    )
  })
}
