import type { Linter } from 'eslint'
import { minimatch } from 'minimatch'
import type { FlatESLintConfigItem } from '~~/types'

function matchGlob(file: string, glob: (Linter.FlatConfigFileSpec | Linter.FlatConfigFileSpec[])[]) {
  const globs = (Array.isArray(glob) ? glob : [glob]).flat()
  return globs.some(glob => typeof glob === 'function' ? glob(file) : minimatch(file, glob))
}

export function isIgnoreOnlyConfig(config: FlatESLintConfigItem) {
  const keys = Object.keys(config).filter(i => !['name'].includes(i))
  return keys.length === 1 && keys[0] === 'ignores'
}

export function getMatchedConfigs(filepath: string, configs: FlatESLintConfigItem[]): number[] {
  const ignoreOnlyConfigs = configs.filter(isIgnoreOnlyConfig)
  const isIgnored = ignoreOnlyConfigs.some(config => matchGlob(filepath, config.ignores!))
  if (isIgnored)
    return []
  const isAnyIncluded = configs.some(config => matchGlob(filepath, config.files || []))
  if (!isAnyIncluded)
    return []

  return configs
    .map((config, index) => {
      const isIncluded = config.files ? matchGlob(filepath, config.files) : true
      const isExcluded = config.ignores ? matchGlob(filepath, config.ignores) : false
      if (isIncluded && !isExcluded)
        return index
      return undefined
    })
    .filter(index => index !== undefined) as number[]
}
