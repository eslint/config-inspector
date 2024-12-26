import type { FlatConfigItem, MatchedFile } from './types'
import { ConfigArray } from '@eslint/config-array'
import { Minimatch } from 'minimatch'

const minimatchOpts = { dot: true }
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
  configArray: ConfigArray,
): MatchedFile {
  const result: MatchedFile = {
    filepath,
    globs: [],
    configs: [],
  }

  configs.forEach((config, index) => {
    const positive = getMatchedGlobs(filepath, config.files || [])
    const negative = getMatchedGlobs(filepath, config.ignores || [])
    if (configArray && !configArray.isFileIgnored(filepath) && positive.length > 0) {
      result.configs.push(index)
      // push positive globs only when there are configs matched
      result.globs.push(...positive)
    }
    // push negative globs except for unignore globs
    result.globs.push(...negative.filter(glob => !glob.startsWith('!')))
  })

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
  rules: NOOP_SCHEMA,
}

export function buildConfigArray(configs: FlatConfigItem[], basePath: string) {
  return new ConfigArray(configs.map(({ index: _, ...c }) => c), {
    basePath,
    schema: FLAT_CONFIG_NOOP_SCHEMA,
  }).normalizeSync()
}
