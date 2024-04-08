import type { Linter } from 'eslint'
import type { RuleMetaData } from '@typescript-eslint/utils/ts-eslint'

export interface FlatESLintConfigItem extends Linter.FlatConfig {
  name?: string
}

export type RuleLevel = 'off' | 'warn' | 'error'

export interface Payload {
  configs: FlatESLintConfigItem[]
  rules: Record<string, RuleInfo>
  meta: PayloadMeta
  files?: MatchedFile[]
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
  configs: FlatESLintConfigItem[]
  globs: Set<Linter.FlatConfigFileSpec>
}

export interface ResolvedPayload extends Payload {
  ruleToState: Map<string, RuleConfigStates>
  globToConfigs: Map<Linter.FlatConfigFileSpec, FlatESLintConfigItem[]>
  filesResolved?: {
    list: string[]
    globToFiles: Map<Linter.FlatConfigFileSpec, Set<string>>
    configToFiles: Map<number, Set<string>>
    fileToGlobs: Map<string, Set<Linter.FlatConfigFileSpec>>
    fileToConfigs: Map<string, FlatESLintConfigItem[]>
    groups: FilesGroup[]
  }
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
