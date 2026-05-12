<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from '#app/composables/router'
import { toggleDark } from '~/composables/dark'
import { isFetching, payload } from '~/composables/payload'
import { filtersRules as filters } from '~/composables/state'

const lastUpdate = useTimeAgo(() => payload.value.meta.lastUpdate)

const rules = computed(() => Object.values(payload.value.rules))
const deprecatedUsing = computed(() => rules.value
  .filter(rule => rule.deprecated && payload.value.ruleToState.get(rule.name)?.some(i => i.level !== 'off')))

const router = useRouter()
function showDeprecated() {
  filters.status = 'deprecated'
  filters.plugin = ''
  filters.state = 'using'
  filters.search = ''

  if (router.currentRoute.value.path !== '/rules')
    router.push('/rules')
}
</script>

<template>
  <ConfigInspectorBadge text-3xl font-200 />
  <div v-if="payload.meta.configPath" flex="~ gap-1 items-center" my1 text-sm>
    <span color-muted font-mono>{{ payload.meta.configPath }}</span>
  </div>
  <div flex="~ gap-1 items-center wrap" text-sm>
    <span color-muted>Composed with</span>
    <span font-bold>{{ payload.configs.length }}</span>
    <span color-muted>config items, updated</span>
    <span color-muted>{{ lastUpdate }}</span>
    <div
      v-if="isFetching"
      flex="~ gap-2 items-center"
      ml2 animate-pulse text-success-700 dark:text-success-300
    >
      <div i-svg-spinners-90-ring-with-bg flex-none text-sm />
      Fetching updates...
    </div>
  </div>
  <div flex="~ gap-3 items-center wrap" py4>
    <NuxtLink
      to="/configs"
      btn-action px3 py1 text-base
      active-class="btn-action-active"
    >
      <div i-ph-stack-duotone flex-none />
      Configs
    </NuxtLink>
    <NuxtLink
      to="/rules"
      btn-action px3 py1 text-base
      active-class="btn-action-active"
    >
      <div i-ph-list-dashes-duotone flex-none />
      Rules
    </NuxtLink>
    <NuxtLink
      v-if="payload.filesResolved"
      to="/files"
      btn-action px3 py1 text-base
      active-class="btn-action-active"
    >
      <div i-ph-files-duotone flex-none />
      Files
    </NuxtLink>
    <button
      title="Toggle Dark Mode"
      i-ph-sun-dim-duotone dark:i-ph-moon-stars-duotone ml1 text-xl color-muted hover:color-base
      @click="toggleDark()"
    />
    <NuxtLink
      href="https://github.com/eslint/config-inspector" target="_blank"
      i-carbon-logo-github text-lg color-muted hover:color-base
    />
    <template v-if="deprecatedUsing.length">
      <div border="l base" ml3 mr2 h-5 w-1px />
      <button
        to="/configs"
        border="~ warning-700/30 dark:warning-300/30 rounded-full"
        flex="~ gap-2 items-center"
        bg-warning-50 px3 py1 text-sm text-warning-700 dark:bg-warning-900:20 hover:bg-warning-100 dark:text-warning-300 dark:hover:bg-warning-900:30
        @click="showDeprecated"
      >
        <div i-ph-warning-duotone flex-none />
        Using {{ deprecatedUsing.length }} deprecated rules
      </button>
    </template>
  </div>
</template>
