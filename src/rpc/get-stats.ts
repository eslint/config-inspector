import type { DevframeScopedNodeContext } from 'devframe'
import type { ErrorInfo, StatsReport } from '../../shared/types'
import { defineRpcFunction } from 'devframe'
import { getLastStatsRun } from './run-stats'

let buildStats: StatsReport | undefined

/**
 * Pre-load the stats report for `build --stats` before calling createBuild —
 * createBuild does not forward CLI flags to setup(), so the build wrapper
 * stashes the result here (see `setBuildPayload`).
 */
export function setBuildStats(report: StatsReport): void {
  buildStats = report
}

/**
 * Read-only access to the latest stats report: the snapshot baked into a
 * static build (`null` when built without `--stats`), or in dev the result
 * of the last `run-stats` run — never triggers a run itself.
 */
export function registerGetStats(
  ctx: DevframeScopedNodeContext<'eslint-config-inspector'>,
): void {
  ctx.rpc.register(defineRpcFunction({
    name: 'get-stats',
    type: 'query',
    snapshot: true,
    handler: async (): Promise<StatsReport | ErrorInfo | null> => {
      if (ctx.mode === 'build')
        return buildStats ?? null
      return await getLastStatsRun() ?? null
    },
  }))
}
