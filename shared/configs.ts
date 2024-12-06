import type { FlatConfigItem, MatchedFile } from './types'
import { Minimatch } from 'minimatch'

const minimatchOpts = { dot: true, flipNegate: true }
const _matchInstances = new Map<string, Minimatch>()

function minimatch(file: string, pattern: string) {
  let m = _matchInstances.get(pattern)
  if (!m) {
    m = new Minimatch(pattern, minimatchOpts)
    _matchInstances.set(pattern, m)
  }
  return m.match(file)
}

function getMatchedGlobs(file: string, glob: (string | string[])[]) {
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

/**
 * Given a list of matched ignore globs, determine if the config is ultimately ignored.
 * If an unignore (leading !) is the last glob, then the config is "unignored".
 */
function isIgnored(negativeGlobs: string[]) {
  return negativeGlobs.length && !negativeGlobs[negativeGlobs.length - 1].startsWith('!')
}

export function matchFile(
  filepath: string,
  configs: FlatConfigItem[],
  ignoreOnlyConfigs: FlatConfigItem[],
): MatchedFile {
  const globalIgnoredConfigs = ignoreOnlyConfigs.map(config => getMatchedGlobs(filepath, config.ignores!))
  const globalIgnored = globalIgnoredConfigs.some(isIgnored)

  if (globalIgnored) {
    return {
      filepath,
      globs: globalIgnoredConfigs.flat(),
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
    if (!isIgnored(negative) && positive.length)
      result.configs.push(index)
    result.globs.push(
      ...positive,
      ...negative,
    )
  })
  return result
}
