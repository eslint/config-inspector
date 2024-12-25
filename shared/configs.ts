import type { FlatConfigItem, MatchedFile } from './types'
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

export function getMatchedGlobs(file: string, globs: (string | string[])[]) {
  const flatGlobs = (Array.isArray(globs) ? globs : [globs]).flat()
  let unmatched: string[] = []

  flatGlobs.forEach((glob, i) => {
    if (minimatch(file, glob)) {
      if (glob.startsWith('!'))
        unmatched.push(glob)
    }
    else {
      if (glob.startsWith('!')) {
        const unignoreMatched = getMatchedGlobs(file, flatGlobs.slice(0, i))
        unmatched = unmatched.concat(unignoreMatched.length > 0 ? unignoreMatched : [], glob)
      }
      else {
        unmatched.push(glob)
      }
    }
  })

  return flatGlobs.filter(glob => !unmatched.includes(glob))
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
  const globIgnoreBlobs = ignoreOnlyConfigs.flatMap(config => config.ignores ?? [])
  const globalIgnored = getMatchedGlobs(filepath, globIgnoreBlobs)

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
