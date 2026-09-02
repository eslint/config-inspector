import type { RuleMetaData } from '@typescript-eslint/utils/ts-eslint'
import type { Linter } from 'eslint'

export interface FlatConfigItem extends Linter.Config {
  index: number
}

export type GlobEntry = string | string[]

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
  globToConfigs: Map<string, FlatConfigItem[]>

  /**
   * Resolved data from files
   * Undefined if users disabled glob matching
   */
  filesResolved?: {
    list: string[]
    globToFiles: Map<string, Set<string>>
    configToFiles: Map<number, Set<string>>
    fileToGlobs: Map<string, Set<string>>
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
   * Matched globs, includes both positive and negative globs.
   *
   * A string entry is a single pattern; an array entry is an intersection
   * (all inner patterns must match), matching ESLint's flat-config semantics.
   */
  globs: GlobEntry[]
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
  /**
   * Deduplicated list of glob entries that matched any file in this group.
   * A `string[]` entry represents an intersection (AND).
   */
  globs: GlobEntry[]
}

export interface PayloadMeta {
  lastUpdate: number
  basePath: string
  configPath: string
}

export interface RuleInfo extends RuleMetaData<any, any> {
  name: string
  plugin: string
  /**
   * The rule may be removed
   */
  invalid?: boolean
}

export interface FiltersConfigsPage {
  rule?: string
  filepath?: string
}

/**
 * Aggregated result of an on-demand `eslint --stats` run.
 * All times are milliseconds.
 */
export interface StatsReport {
  totals: {
    /** Sum of per-file lint totals */
    total: number
    parse: number
    rules: number
    fix: number
    /** Remainder of `total` not attributed to parse/rules/fix */
    other: number
  }
  /** Per-rule total time across all files, sorted descending */
  rules: RuleTimeBreakdown[]
  /** Per-file timing breakdown, sorted by total descending */
  files: FileTimeStat[]
  /** Slowest individual rule-on-file tasks, sorted descending (capped) */
  tasks: TaskTimeStat[]
  errorCount: number
  warningCount: number
  meta: {
    timestamp: number
    /** Wall-clock duration of the whole eslint run */
    durationMs: number
  }
}

export interface RuleTimeStat {
  name: string
  time: number
}

export interface RuleTimeBreakdown extends RuleTimeStat {
  /** Slowest files for this rule, sorted descending */
  topFiles: RuleTimeStat[]
}

export interface TaskTimeStat {
  rule: string
  /** Relative to the base path */
  filepath: string
  time: number
}

export interface FileTimeStat {
  /** Relative to the base path */
  filepath: string
  total: number
  parse: number
  rules: number
  fix: number
  /** Slowest rules for this file, sorted descending */
  topRules: RuleTimeStat[]
}

export interface RuleConfigState {
  name: string
  configIndex: number
  level: RuleLevel
  options?: any[]
}

export type RuleConfigStates = RuleConfigState[]
