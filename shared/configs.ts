import type { PropertyDefinition } from '@eslint/config-array'
import type { Linter } from 'eslint'
import type { MinimatchOptions } from 'minimatch'
import type { FlatConfigItem, MatchedFile } from './types'
import { ConfigArray } from '@eslint/config-array'
import { Minimatch } from 'minimatch'

const minimatchOpts: MinimatchOptions = { dot: true, flipNegate: true }
const _matchInstances = new Map<string, Minimatch>()

function minimatch(file: string, pattern: string) {
  let m = _matchInstances.get(pattern)
  if (!m) {
    m = new Minimatch(pattern, minimatchOpts)
    _matchInstances.set(pattern, m)
  }
  return m.match(file)
}

/**
 * Returns the entries from `globs` that match `file`.
 *
 * An entry is either a string pattern (matches when the file matches that pattern)
 * or an array of string patterns representing an intersection — i.e. the file
 * must match every pattern in the inner array. This mirrors ESLint's flat-config
 * semantics in `@eslint/config-array`'s `pathMatches`.
 */
export function getMatchedGlobs(file: string, globs: (string | string[])[]): (string | string[])[] {
  return globs.filter(g =>
    Array.isArray(g)
      ? g.every(p => minimatch(file, p))
      : minimatch(file, g),
  )
}

/**
 * Structural equality for a single glob entry (string or `string[]`).
 */
export function isSameGlobEntry(a: string | string[], b: string | string[]): boolean {
  if (Array.isArray(a) !== Array.isArray(b))
    return false
  if (Array.isArray(a))
    return a.length === (b as string[]).length && a.every((x, i) => x === (b as string[])[i])
  return a === b
}

function globEntryKey(g: string | string[]): string {
  return Array.isArray(g) ? `[${g.join('\x00')}]` : g
}

const META_KEYS = new Set(['name', 'index'])

/**
 * Config with only `ignores` property
 */
export function isIgnoreOnlyConfig(config: FlatConfigItem) {
  const keys = Object.keys(config).filter(i => !META_KEYS.has(i))
  return keys.length === 1 && keys[0] === 'ignores'
}

/**
 * Config without `files` and `ignores` properties or with only `ignores` property
 */
export function isGeneralConfig(config: FlatConfigItem) {
  return (!config.files && !config.ignores) || isIgnoreOnlyConfig(config)
}

export function matchFile(
  filepath: string,
  configs: FlatConfigItem[],
  basePath: string,
): MatchedFile {
  const result: MatchedFile = {
    filepath,
    globs: [],
    configs: [],
  }

  const {
    config: globalMatchedConfig = {},
    status: globalMatchStatus,
  } = buildConfigArray(configs, basePath).getConfigWithStatus(filepath)
  configs.forEach((config) => {
    const positive = getMatchedGlobs(filepath, config.files || [])
    const negative = getMatchedGlobs(filepath, config.ignores || [])

    if (globalMatchStatus === 'matched' && globalMatchedConfig.index?.includes(config.index) && positive.length > 0) {
      result.configs.push(config.index)
      // push positive globs only when there are configs matched
      result.globs.push(...positive)
    }

    result.globs.push(...negative)
  })

  const seen = new Set<string>()
  result.globs = result.globs.filter((g) => {
    const k = globEntryKey(g)
    if (seen.has(k))
      return false
    seen.add(k)
    return true
  })

  return result
}

const NOOP_SCHEMA: PropertyDefinition = {
  merge: 'replace',
  validate() {},
}

const FLAT_CONFIG_NOOP_SCHEMA = {
  settings: NOOP_SCHEMA,
  linterOptions: NOOP_SCHEMA,
  language: NOOP_SCHEMA,
  languageOptions: NOOP_SCHEMA,
  processor: NOOP_SCHEMA,
  plugins: NOOP_SCHEMA,
  index: {
    ...NOOP_SCHEMA,
    // accumulate the matched config index to an array
    merge(v1: number, v2: number) {
      return [v1].concat(v2).flat()
    },
  },
  rules: NOOP_SCHEMA,
}

export function buildConfigArray(configs: Linter.Config[], basePath: string) {
  return new ConfigArray(configs, {
    basePath,
    schema: FLAT_CONFIG_NOOP_SCHEMA,
  }).normalizeSync()
}
