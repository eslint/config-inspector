import type { ErrorInfo, StatsReport } from '~~/shared/types'
import { ref } from 'vue'
import { rpcCall } from './payload'

export const statsReport = ref<StatsReport>()
export const statsError = ref<ErrorInfo>()
export const isRunningStats = ref(false)

function isErrorInfo(result: StatsReport | ErrorInfo): result is ErrorInfo {
  return 'error' in result
}

let loadPromise: Promise<void> | undefined

/**
 * Load a stats report computed elsewhere without triggering a run: the
 * snapshot baked into a static build (`build --stats`), or the run started
 * eagerly by the `--stats` CLI flag. Resolves to nothing when no report
 * is available.
 */
export function loadStatsReport() {
  loadPromise ??= (async () => {
    isRunningStats.value = true
    try {
      const result = await rpcCall<StatsReport | ErrorInfo | null>('eslint-config-inspector:get-stats')
      if (!result)
        return
      if (isErrorInfo(result))
        statsError.value = result
      else
        statsReport.value = result
    }
    catch (e) {
      statsError.value = { error: String(e) }
    }
    finally {
      isRunningStats.value = false
    }
  })()
  return loadPromise
}

export async function runStatsAnalysis() {
  if (isRunningStats.value)
    return
  isRunningStats.value = true
  statsError.value = undefined
  try {
    const result = await rpcCall<StatsReport | ErrorInfo>('eslint-config-inspector:run-stats')
    if (isErrorInfo(result))
      statsError.value = result
    else
      statsReport.value = result
  }
  catch (e) {
    statsError.value = { error: String(e) }
  }
  finally {
    isRunningStats.value = false
  }
}
