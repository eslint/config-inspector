<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { filtersRules as filters, stateStorage } from '~/composables/state'
import { useRouter } from '#app/composables/router'
import { isFetching, payload } from '~/composables/payload'
import { toggleDark } from '~/composables/dark'

const lastUpdate = useTimeAgo(() => payload.value.meta.lastUpdate)

const rules = computed(() => Object.values(payload.value.rules))
const deprecatedUsing = computed(() => rules.value
  .filter(rule => rule.deprecated && payload.value.ruleStateMap.get(rule.name)?.some(i => i.level !== 'off')))

const router = useRouter()
function showDeprecated() {
  filters.status = 'deprecated'
  filters.plugin = ''
  filters.state = 'using'
  filters.search = ''

  if (router.currentRoute.value.path !== '/rules')
    router.push('/rules')
}

function toggleRuleView() {
  stateStorage.value.viewType = stateStorage.value.viewType === 'list' ? 'grid' : 'list'
}
</script>

<template>
  <ConfigInspectorBadge text-3xl font-200 />
  <div v-if="payload.meta.configPath" flex="~ gap-1 items-center" text-sm my1>
    <span font-mono op35>{{ payload.meta.configPath }}</span>
  </div>
  <div flex="~ gap-1 items-center wrap" text-sm>
    <span op50>Composed with</span>
    <span font-bold>{{ payload.configs.length }}</span>
    <span op50>config items, updated</span>
    <span op75>{{ lastUpdate }}</span>
    <div
      v-if="isFetching"
      flex="~ gap-2 items-center"
      text-green ml2 animate-pulse
    >
      <div i-svg-spinners-90-ring-with-bg text-sm flex-none />
      Fetching updates...
    </div>
  </div>
  <div flex="~ gap-3 items-center wrap" py4>
    <NuxtLink
      to="/configs" active-class="op100! bg-active"
      px3 py1 op50 border="~ base rounded"
      flex="~ gap-2 items-center"
    >
      <div i-ph-stack-duotone flex-none />
      Configs
    </NuxtLink>
    <NuxtLink
      to="/rules" active-class="op100! bg-active"
      px3 py1 op50 border="~ base rounded"
      flex="~ gap-2 items-center"
    >
      <div i-ph-list-dashes-duotone flex-none />
      Rules
    </NuxtLink>
    <NuxtLink
      v-if="payload.files"
      to="/files" active-class="op100! bg-active"
      px3 py1 op50 border="~ base rounded"
      flex="~ gap-2 items-center"
    >
      <div i-ph-files-duotone flex-none />
      Files
    </NuxtLink>
    <button
      title="Toggle Dark Mode"
      i-ph-sun-dim-duotone dark:i-ph-moon-stars-duotone ml1 text-xl op50 hover:op75
      @click="toggleDark()"
    />
    <button
      title="Toggle Rule View"
      lt-md:hidden
      :class="stateStorage.viewType === 'list' ? 'i-ph-list-duotone' : 'i-ph-grid-four-duotone'"
      text-xl op50 hover:op75
      @click="toggleRuleView()"
    />
    <NuxtLink
      href="https://github.com/eslint/config-inspector" target="_blank"
      i-carbon-logo-github text-lg op50 hover:op75
    />
    <template v-if="deprecatedUsing.length">
      <div w-1px border="l base" h-5 ml3 mr2 />
      <button
        to="/configs"
        border="~ orange/20 rounded-full"
        flex="~ gap-2 items-center"
        bg-orange:5 px3 py1 text-sm text-orange hover:bg-orange:10
        @click="showDeprecated"
      >
        <div i-ph-warning-duotone flex-none />
        Using {{ deprecatedUsing.length }} deprecated rules
      </button>
    </template>
  </div>
</template>
