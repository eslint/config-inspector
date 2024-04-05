import type { Linter } from 'eslint'
import { minimatch } from 'minimatch'
import type { FileConfigMatchResult, FlatESLintConfigItem } from '~~/types'

function getMatchedGlobs(file: string, glob: (Linter.FlatConfigFileSpec | Linter.FlatConfigFileSpec[])[]) {
  const globs = (Array.isArray(glob) ? glob : [glob]).flat()
  return globs.filter(glob => typeof glob === 'function' ? glob(file) : minimatch(file, glob)).flat()
}

function matchGlob(file: string, glob: (Linter.FlatConfigFileSpec | Linter.FlatConfigFileSpec[])[]) {
  return getMatchedGlobs(file, glob).length > 0
}

export function isIgnoreOnlyConfig(config: FlatESLintConfigItem) {
  const keys = Object.keys(config).filter(i => !['name'].includes(i))
  return keys.length === 1 && keys[0] === 'ignores'
}

export function getMatchedConfigs(filepath: string, configs: FlatESLintConfigItem[]): FileConfigMatchResult[] {
  const ignoreOnlyConfigs = configs.filter(isIgnoreOnlyConfig)
  const isIgnored = ignoreOnlyConfigs.some(config => matchGlob(filepath, config.ignores!))
  if (isIgnored)
    return []

  const isAnyIncluded = configs.some(config => matchGlob(filepath, config.files || []))
  if (!isAnyIncluded)
    return []

  return configs
    .map((config, index): FileConfigMatchResult | undefined => {
      if (config.ignores && matchGlob(filepath, config.ignores))
        return undefined
      if (!config.files) {
        return {
          config,
          index,
          globs: [],
        }
      }
      const includeGlob = getMatchedGlobs(filepath, config.files)
      if (!includeGlob.length)
        return undefined
      return {
        config,
        index,
        globs: includeGlob,
      }
    })
    .filter(notNullish)
}

function notNullish<T>(value: T): value is NonNullable<T> {
  return value != null
}
