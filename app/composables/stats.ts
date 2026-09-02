import type { ErrorInfo, StatsReport } from '~~/shared/types'
import { ref } from 'vue'
import { rpcCall } from './payload'

export const statsReport = ref<StatsReport>()
export const statsError = ref<ErrorInfo>()
export const isRunningStats = ref(false)

function isErrorInfo(result: StatsReport | ErrorInfo): result is ErrorInfo {
  return 'error' in result
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
