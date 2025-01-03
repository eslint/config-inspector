import type { Linter } from 'eslint'
import type { FlatConfigItem, MatchedFile } from './types'
import { ConfigArray } from '@eslint/config-array'
import { Minimatch, type MinimatchOptions } from 'minimatch'

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

export function getMatchedGlobs(file: string, glob: (string | string[])[]) {
  const globs = (Array.isArray(glob) ? glob : [glob]).flat()
  return globs.filter(glob => minimatch(file, glob)).flat()
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

  result.globs = [...new Set(result.globs)]

  return result
}

const NOOP_SCHEMA = {
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
