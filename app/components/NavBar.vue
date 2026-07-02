<script setup lang="ts">
import ActionButton from '@antfu/design/components/Action/ActionButton.vue'
import ActionDarkToggle from '@antfu/design/components/Action/ActionDarkToggle.vue'
import FeedbackSpinner from '@antfu/design/components/Feedback/FeedbackSpinner.vue'
import { useTimeAgo } from '@vueuse/core'
import { computed } from 'vue'
import { useRouter } from '#app/composables/router'
import { NuxtLink } from '#components'
import ConfigInspectorBadge from '~/components/ConfigInspectorBadge.vue'
import { isDark } from '~/composables/dark'
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
  <ConfigInspectorBadge class="text-3xl font-200" />
  <div v-if="payload.meta.configPath" class="text-sm my1 flex gap-1 items-center">
    <span class="color-muted font-mono">{{ payload.meta.configPath }}</span>
  </div>
  <div class="text-sm flex flex-wrap gap-1 items-center">
    <span class="color-muted">Composed with</span>
    <span class="font-bold">{{ payload.configs.length }}</span>
    <span class="color-muted">config items, updated</span>
    <span class="color-muted">{{ lastUpdate }}</span>
    <div
      v-if="isFetching"
      class="text-success-700 ml2 flex gap-2 items-center animate-pulse dark:text-success-300"
    >
      <FeedbackSpinner class="text-sm flex-none" />
      Fetching updates...
    </div>
  </div>
  <div class="py4 flex flex-wrap gap-3 items-center">
    <NuxtLink
      to="/configs"
      class="text-base btn-action px3 py1"
      active-class="btn-action-active"
    >
      <div class="i-ph-stack-duotone flex-none" />
      Configs
    </NuxtLink>
    <NuxtLink
      to="/rules"
      class="text-base btn-action px3 py1"
      active-class="btn-action-active"
    >
      <div class="i-ph-list-dashes-duotone flex-none" />
      Rules
    </NuxtLink>
    <NuxtLink
      v-if="payload.filesResolved"
      to="/files"
      class="text-base btn-action px3 py1"
      active-class="btn-action-active"
    >
      <div class="i-ph-files-duotone flex-none" />
      Files
    </NuxtLink>
    <ActionDarkToggle
      :color-scheme="isDark ? 'dark' : 'light'"
      @update:color-scheme="isDark = $event === 'dark'"
    >
      <template #default="{ toggle }">
        <button
          type="button"
          title="Toggle Dark Mode"
          aria-label="Toggle Dark Mode"
          class="i-ph-sun-dim-duotone dark:i-ph-moon-stars-duotone text-xl color-muted ml1 hover:color-base"
          @click="toggle"
        />
      </template>
    </ActionDarkToggle>
    <NuxtLink
      href="https://github.com/eslint/config-inspector" target="_blank"
      aria-label="GitHub repository"
      class="i-carbon-logo-github text-lg color-muted hover:color-base"
    />
    <template v-if="deprecatedUsing.length">
      <div class="ml3 mr2 border-l border-base h-5 w-1px" />
      <ActionButton
        icon="i-ph-warning-duotone"
        class="text-warning-700 border-warning-700/30 bg-warning-400/10 dark:text-warning-300 dark:border-warning-300/30 rounded-full! hover:bg-warning-400/20"
        @click="showDeprecated"
      >
        Using {{ deprecatedUsing.length }} deprecated rules
      </ActionButton>
    </template>
  </div>
</template>
