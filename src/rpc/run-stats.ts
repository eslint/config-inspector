import type { DevframeScopedNodeContext } from 'devframe'
import type { ErrorInfo, FileTimeStat, RuleTimeStat, StatsReport } from '../../shared/types'
import type { ResolveConfigPathOptions } from '../configs'
import type { ExecFileException } from 'node:child_process'
import { execFile } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { defineRpcFunction } from 'devframe'
import { resolve as resolveModule } from 'mlly'
import { dirname, join, relative } from 'pathe'
import { resolveConfigPath } from '../configs'
import { MARK_CHECK, MARK_INFO } from '../constants'
import { ConfigInspectorError } from '../errors'

/**
 * Subset of a lint result from ESLint's `json` formatter when run with
 * `--stats`: https://eslint.org/docs/latest/extend/stats
 */
interface StatsLintResult {
  filePath: string
  errorCount: number
  warningCount: number
  stats?: {
    times: {
      passes: {
        parse: { total: number }
        rules?: Record<string, { total: number }>
        fix: { total: number }
        total: number
      }[]
    }
  }
}

const TOP_RULES_PER_FILE = 10

export function registerRunStats(
  ctx: DevframeScopedNodeContext<'eslint-config-inspector'>,
  readOptions: ResolveConfigPathOptions,
): void {
  let running: Promise<StatsReport | ErrorInfo> | undefined

  async function run(): Promise<StatsReport | ErrorInfo> {
    try {
      const { basePath, configPath } = await resolveConfigPath(readOptions)
      console.log(MARK_INFO, 'Running ESLint with stats enabled')
      const report = await runStatsAnalysis(basePath, configPath)
      console.log(MARK_CHECK, 'Stats analysis finished in', Math.round(report.meta.durationMs), 'ms')
      return report
    }
    catch (e) {
      if (e instanceof ConfigInspectorError)
        e.prettyPrint()
      else
        console.error(e)
      return { message: 'Failed to run ESLint stats analysis', error: String(e) }
    }
  }

  ctx.rpc.register(defineRpcFunction({
    name: 'run-stats',
    type: 'action',
    handler: async (): Promise<StatsReport | ErrorInfo> => {
      // Deduplicate concurrent runs — a second call awaits the in-flight one
      running ??= run().finally(() => {
        running = undefined
      })
      return running
    },
  }))
}

/**
 * Run the project's own `eslint` binary with `--stats -f json` and aggregate
 * the timing data. Spawned as a child process so a long lint run never blocks
 * the RPC server.
 */
export async function runStatsAnalysis(
  basePath: string,
  configPath: string,
): Promise<StatsReport> {
  // Resolve `eslint` from the user's project, like `readConfig` does
  const pkgPath = await resolveModule('eslint/package.json', { url: basePath })
    .catch(() => {
      throw new ConfigInspectorError('Failed to resolve the `eslint` package from your project. Make sure ESLint is installed.')
    })
  const eslintBin = join(dirname(fileURLToPath(pkgPath)), 'bin/eslint.js')

  const started = Date.now()
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [eslintBin, '--config', configPath, '--stats', '--format', 'json', '.'],
    { cwd: basePath, maxBuffer: Number.MAX_SAFE_INTEGER },
  ).catch((e: ExecFileException & { stdout?: string, stderr?: string }) => {
    // Exit code 1 just means lint problems were found — stats are still there
    if (e.code === 1 && e.stdout)
      return { stdout: e.stdout }
    throw new ConfigInspectorError(`ESLint exited with code ${e.code}:\n${e.stderr?.trim() ?? e.message}`)
  })

  let results: StatsLintResult[]
  try {
    results = JSON.parse(stdout)
  }
  catch {
    throw new ConfigInspectorError('Failed to parse ESLint JSON output')
  }

  return aggregateStats(results, basePath, Date.now() - started)
}

export function aggregateStats(
  results: StatsLintResult[],
  basePath: string,
  durationMs: number,
): StatsReport {
  const ruleTimes = new Map<string, number>()
  const files: FileTimeStat[] = []
  const totals = { total: 0, parse: 0, rules: 0, fix: 0, other: 0 }
  let errorCount = 0
  let warningCount = 0

  for (const result of results) {
    errorCount += result.errorCount
    warningCount += result.warningCount
    if (!result.stats)
      continue

    const file: FileTimeStat = {
      filepath: relative(basePath, result.filePath).replaceAll('\\', '/'),
      total: 0,
      parse: 0,
      rules: 0,
      fix: 0,
      topRules: [],
    }
    const fileRuleTimes = new Map<string, number>()

    for (const pass of result.stats.times.passes) {
      file.total += pass.total
      file.parse += pass.parse.total
      file.fix += pass.fix.total
      for (const [name, { total }] of Object.entries(pass.rules ?? {})) {
        file.rules += total
        fileRuleTimes.set(name, (fileRuleTimes.get(name) ?? 0) + total)
        ruleTimes.set(name, (ruleTimes.get(name) ?? 0) + total)
      }
    }

    file.topRules = sortTimes(fileRuleTimes).slice(0, TOP_RULES_PER_FILE)
    files.push(file)
    totals.total += file.total
    totals.parse += file.parse
    totals.rules += file.rules
    totals.fix += file.fix
  }

  totals.other = Math.max(0, totals.total - totals.parse - totals.rules - totals.fix)
  files.sort((a, b) => b.total - a.total)

  return {
    totals,
    rules: sortTimes(ruleTimes),
    files,
    errorCount,
    warningCount,
    meta: { durationMs },
  }
}

function sortTimes(map: Map<string, number>): RuleTimeStat[] {
  return [...map.entries()]
    .map(([name, time]) => ({ name, time }))
    .sort((a, b) => b.time - a.time)
}
