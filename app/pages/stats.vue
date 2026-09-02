<script setup lang="ts">
import type { RuleTimeStat } from '~~/shared/types'
import { computed, ref, watch } from 'vue'
import ColorizedRuleName from '~/components/ColorizedRuleName.vue'
import StatsBarRow from '~/components/StatsBarRow.vue'
import StatsBreakdownBar from '~/components/StatsBreakdownBar.vue'
import { getPluginColor } from '~/composables/color'
import { filepathIconsMap } from '~/composables/icons'
import { isStaticConnection, payload } from '~/composables/payload'
import { stateStorage } from '~/composables/state'
import { isRunningStats, loadStatsReport, runStatsAnalysis, statsError, statsReport } from '~/composables/stats'
import { formatDuration } from '~/composables/strings'

// Pick up a report computed elsewhere: a static build snapshot, or an
// eager run started by the `--stats` CLI flag
void loadStatsReport()

const DEFAULT_SHOWN = 25

const shownLimit = ref(DEFAULT_SHOWN)
watch(
  () => [stateStorage.value.viewStatsTab, statsReport.value],
  () => shownLimit.value = DEFAULT_SHOWN,
)

function pluginName(ruleName: string) {
  return payload.value.rules[ruleName]?.plugin
    || (ruleName.includes('/') ? ruleName.split('/')[0]! : 'eslint')
}

const plugins = computed<RuleTimeStat[]>(() => {
  const map = new Map<string, number>()
  for (const { name, time } of statsReport.value?.rules ?? []) {
    const plugin = pluginName(name)
    map.set(plugin, (map.get(plugin) ?? 0) + time)
  }
  return [...map.entries()]
    .map(([name, time]) => ({ name, time }))
    .sort((a, b) => b.time - a.time)
})

const activeList = computed<RuleTimeStat[]>(() => {
  if (!statsReport.value)
    return []
  switch (stateStorage.value.viewStatsTab) {
    case 'plugins': return plugins.value
    case 'files': return statsReport.value.files.map(f => ({ name: f.filepath, time: f.total }))
    default: return statsReport.value.rules
  }
})

const activeTotal = computed(() => {
  if (!statsReport.value)
    return 0
  return stateStorage.value.viewStatsTab === 'files'
    ? statsReport.value.totals.total
    : statsReport.value.totals.rules
})

const activeMax = computed(() => activeList.value[0]?.time ?? 0)
const shownList = computed(() => activeList.value.slice(0, shownLimit.value))

const fileDetails = computed(() => {
  const map = new Map(statsReport.value?.files.map(f => [f.filepath, f]))
  return (filepath: string) => map.get(filepath)
})

function fileIcon(filepath: string) {
  for (const rule of filepathIconsMap) {
    if (rule.match.test(filepath))
      return rule.icon
  }
  return 'i-ph-file-duotone'
}

const breakdownSegments = computed(() => {
  const totals = statsReport.value?.totals
  if (!totals)
    return []
  return [
    { label: 'Rules', time: totals.rules, color: '#8080F2' },
    { label: 'Parse', time: totals.parse, color: '#FDB022' },
    { label: 'Fix', time: totals.fix, color: '#32D583' },
    { label: 'Other', time: totals.other, color: '#98A2B3' },
  ]
})
</script>

<template>
  <div flex="~ col gap-4" my4>
    <div color-muted>
      This tab runs ESLint on your project with
      <a href="https://eslint.org/docs/latest/extend/stats" target="_blank" text-primary-700 dark:text-primary-400 hover:underline>timing statistics</a>
      enabled, and visualizes where the linting time is spent.
    </div>

    <div v-if="isRunningStats" flex="~ gap-2 items-center" animate-pulse p3>
      <div i-svg-spinners-90-ring-with-bg flex-none />
      Running ESLint with stats enabled, this may take a while...
    </div>

    <div v-else-if="statsError" flex="~ col gap-2" border="~ rose-700/30 rounded" bg-rose-50 p3 text-rose-700 dark:bg-rose-900:20 dark:text-rose-300>
      <div flex="~ gap-2 items-center" font-bold>
        <div i-ph-warning-duotone flex-none />
        {{ statsError.message || 'Failed to run stats analysis' }}
      </div>
      <pre of-auto ws-pre-wrap text-sm>{{ statsError.error }}</pre>
      <div v-if="!isStaticConnection">
        <button btn-action px3 @click="runStatsAnalysis()">
          <div i-ph-arrow-clockwise-duotone />
          Retry
        </button>
      </div>
    </div>

    <div v-else-if="!statsReport && isStaticConnection" p3 color-muted italic>
      Stats are not available in this static build.
      Inspect with live mode, or run
      <code rounded bg-code px1>pnpx @eslint/config-inspector build --stats</code>
      to include the stats result.
    </div>

    <div v-else-if="!statsReport">
      <button btn-action px3 py1 text-base @click="runStatsAnalysis()">
        <div i-ph-gauge-duotone flex-none />
        Run Stats Analysis
      </button>
    </div>

    <template v-if="statsReport && !isRunningStats">
      <div flex="~ gap-x-4 gap-y-1 items-center wrap" text-sm>
        <span>
          Linted <span font-bold>{{ statsReport.files.length }}</span> files
          in <span font-bold font-mono>{{ formatDuration(statsReport.meta.durationMs) }}</span>
        </span>
        <span color-muted>·</span>
        <span color-muted>
          <span font-mono>{{ formatDuration(statsReport.totals.total) }}</span> total lint time
        </span>
        <span color-muted>·</span>
        <span color-muted>
          {{ statsReport.errorCount }} errors, {{ statsReport.warningCount }} warnings
        </span>
        <button v-if="!isStaticConnection" ml2 btn-action-sm @click="runStatsAnalysis()">
          <div i-ph-arrow-clockwise-duotone />
          Re-run
        </button>
      </div>

      <StatsBreakdownBar :segments="breakdownSegments" />

      <div border="~ base rounded" flex="~ inline" self-start>
        <button
          :class="stateStorage.viewStatsTab === 'rules' ? 'btn-action-active' : ''"
          btn-action border-none
          @click="stateStorage.viewStatsTab = 'rules'"
        >
          <div i-ph-list-dashes-duotone />
          <span>Slow Rules</span>
        </button>
        <div border="l base" />
        <button
          :class="stateStorage.viewStatsTab === 'plugins' ? 'btn-action-active' : ''"
          btn-action border-none
          @click="stateStorage.viewStatsTab = 'plugins'"
        >
          <div i-ph-plug-duotone />
          <span>Slow Plugins</span>
        </button>
        <div border="l base" />
        <button
          :class="stateStorage.viewStatsTab === 'files' ? 'btn-action-active' : ''"
          btn-action border-none
          @click="stateStorage.viewStatsTab = 'files'"
        >
          <div i-ph-files-duotone />
          <span>Slow Files</span>
        </button>
      </div>

      <div flex="~ col gap-1">
        <template v-if="stateStorage.viewStatsTab === 'files'">
          <details v-for="item of shownList" :key="item.name">
            <summary cursor-pointer list-none>
              <StatsBarRow :time="item.time" :max="activeMax" :total="activeTotal">
                <div :class="fileIcon(item.name)" flex-none h="1em" />
                <span of-hidden text-ellipsis ws-nowrap font-mono>{{ item.name }}</span>
              </StatsBarRow>
            </summary>
            <div v-if="fileDetails(item.name)" flex="~ col gap-1" my1 ml6>
              <div flex="~ gap-4" text-xs color-muted font-mono>
                <span>parse {{ formatDuration(fileDetails(item.name)!.parse) }}</span>
                <span>rules {{ formatDuration(fileDetails(item.name)!.rules) }}</span>
                <span>fix {{ formatDuration(fileDetails(item.name)!.fix) }}</span>
              </div>
              <StatsBarRow
                v-for="rule of fileDetails(item.name)!.topRules"
                :key="rule.name"
                :time="rule.time"
                :max="fileDetails(item.name)!.topRules[0]?.time ?? 0"
                :total="item.time"
                :color="getPluginColor(pluginName(rule.name))"
              >
                <ColorizedRuleName :name="rule.name" borderless />
              </StatsBarRow>
            </div>
          </details>
        </template>
        <template v-else-if="stateStorage.viewStatsTab === 'plugins'">
          <StatsBarRow
            v-for="item of shownList"
            :key="item.name"
            :time="item.time"
            :max="activeMax"
            :total="activeTotal"
            :color="getPluginColor(item.name)"
          >
            <span font-mono :style="{ color: getPluginColor(item.name) }">{{ item.name }}</span>
          </StatsBarRow>
        </template>
        <template v-else>
          <StatsBarRow
            v-for="item of shownList"
            :key="item.name"
            :time="item.time"
            :max="activeMax"
            :total="activeTotal"
            :color="getPluginColor(pluginName(item.name))"
          >
            <ColorizedRuleName :name="item.name" borderless />
          </StatsBarRow>
        </template>

        <button
          v-if="activeList.length > shownList.length"
          btn-action self-start px3
          @click="shownLimit += 50"
        >
          Show more ({{ activeList.length - shownList.length }} remaining)
        </button>
      </div>
    </template>
  </div>
</template>
