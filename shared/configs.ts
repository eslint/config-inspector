import { Minimatch } from 'minimatch'
import type { FlatConfigItem, MatchedFile } from './types'

const minimatchOpts = { dot: true, matchBase: true }
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
  ignoreOnlyConfigs: FlatConfigItem[],
): MatchedFile {
  const globalIgnored = ignoreOnlyConfigs.flatMap(config => getMatchedGlobs(filepath, config.ignores!))
  if (globalIgnored.length) {
    return {
      filepath,
      globs: globalIgnored,
      configs: [],
    }
  }

  const result: MatchedFile = {
    filepath,
    globs: [],
    configs: [],
  }
  configs.forEach((config, index) => {
    const positive = getMatchedGlobs(filepath, config.files || [])
    const negative = getMatchedGlobs(filepath, config.ignores || [])
    if (!negative.length && positive.length)
      result.configs.push(index)
    result.globs.push(
      ...positive,
      ...negative,
    )
  })
  return result
}
