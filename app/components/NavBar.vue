<script setup lang="ts">
import { computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import { version } from '../../package.json'
import { filtersRules as filters, stateStorage } from '~/composables/state'
import { useRouter } from '#app/composables/router'
import { payload } from '~/composables/payload'

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
  <div text-3xl font-200>
    <a
      href="https://github.com/eslint/config-inspector" target="_blank"
      flex="inline gap-2 items-center" mr1
    >
      <img src="/favicon.svg" inline-block h-1em> ESLint Config Inspector
    </a>
    <a
      op50 font-mono text-base inline-block translate-y--5 ml1
      :href="`https://github.com/eslint/config-inspector/releases/tag/v${version}`" target="_blank"
    >
      v{{ version }}
    </a>
  </div>
  <div v-if="payload.meta.configPath" flex="~ gap-1 items-center" text-sm my1>
    <span font-mono op35>{{ payload.meta.configPath }}</span>
  </div>
  <div flex="~ gap-1 items-center wrap" text-sm>
    <span op50>Composed with</span>
    <span font-bold>{{ payload.configs.length }}</span>
    <span op50>config items, updated</span>
    <span op75>{{ lastUpdate }}</span>
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
    <button
      title="Toggle Dark Mode"
      i-ph-sun-dim-duotone dark:i-ph-moon-stars-duotone ml1 text-xl op50 hover:op75
      @click="toggleDark()"
    />
    <button
      title="Toggle Rule View"
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
~/app/composables/state~/app/composables/payload
