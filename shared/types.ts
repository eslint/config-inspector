import type { Linter } from 'eslint'
import type { RuleMetaData } from '@typescript-eslint/utils/ts-eslint'

export interface FlatConfigItem extends Linter.FlatConfig {
  name?: string
  index: number
}

export type RuleLevel = 'off' | 'warn' | 'error'

export interface Payload {
  configs: FlatConfigItem[]
  rules: Record<string, RuleInfo>
  meta: PayloadMeta
  files?: MatchedFile[]
}

export interface ResolvedPayload extends Payload {
  configsIgnoreOnly: FlatConfigItem[]
  configsGeneral: FlatConfigItem[]

  ruleToState: Map<string, RuleConfigStates>
  globToConfigs: Map<Linter.FlatConfigFileSpec, FlatConfigItem[]>

  /**
   * Resolved data from files
   * Undefined if users disabled glob matching
   */
  filesResolved?: {
    list: string[]
    globToFiles: Map<Linter.FlatConfigFileSpec, Set<string>>
    configToFiles: Map<number, Set<string>>
    fileToGlobs: Map<string, Set<Linter.FlatConfigFileSpec>>
    fileToConfigs: Map<string, FlatConfigItem[]>
    groups: FilesGroup[]
  }
}

export interface MatchedFile {
  /**
   * Filepath
   */
  filepath: string
  /**
   * Matched globs, includes both positive and negative globs
   */
  globs: Linter.FlatConfigFileSpec[]
  /**
   * Matched configs indexes
   */
  configs: number[]
}

export interface ErrorInfo {
  error: string
  message?: string
}

export interface FilesGroup {
  id: string
  files: string[]
  configs: FlatConfigItem[]
  globs: Set<Linter.FlatConfigFileSpec>
}

export interface PayloadMeta {
  wsPort?: number
  lastUpdate: number
  basePath: string
  configPath: string
}

export interface RuleInfo extends RuleMetaData<any, any> {
  name: string
  plugin: string
}

export interface FiltersConfigsPage {
  rule?: string
  filepath?: string
}

export interface RuleConfigState {
  name: string
  configIndex: number
  level: RuleLevel
  options?: any[]
}

export type RuleConfigStates = RuleConfigState[]
