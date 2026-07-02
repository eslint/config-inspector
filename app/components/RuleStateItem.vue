<script setup lang="ts">
import type { RuleConfigState } from '~~/shared/types'
import ActionToggleGroup from '@antfu/design/components/Action/ActionToggleGroup.vue'
import { computed, ref } from 'vue'
import { useRouter } from '#app/composables/router'
import ColorizedConfigName from '~/components/ColorizedConfigName'
import GlobItem from '~/components/GlobItem.vue'
import RuleLevelIcon from '~/components/RuleLevelIcon.vue'
import Shiki from '~/components/Shiki'
import { deepCompareOptions } from '~/composables/options'
import { getRuleDefaultOptions, payload } from '~/composables/payload'
import { filtersConfigs } from '~/composables/state'
import { nth, stringifyOptions } from '~/composables/strings'

const props = defineProps<{
  state: RuleConfigState
  isLocal?: boolean
}>()

const colors = {
  error: 'color-scale-critical',
  warn: 'color-scale-medium',
  off: 'color-muted',
}

const config = computed(() => payload.value.configs[props.state.configIndex]!)

const defaultOptions = computed(() => getRuleDefaultOptions(props.state.name))

const comparedOptions = computed(() => deepCompareOptions(props.state.options ?? [], defaultOptions.value))

const initialRuleOptionsView = computed(() => !props.state.options?.length && defaultOptions.value?.length ? 'default' : 'state')

const viewTypeState = ref<'state' | 'default'>(initialRuleOptionsView.value)
const viewType = computed<string | string[] | undefined>({
  get: () => viewTypeState.value,
  set: (value) => {
    // Ignore deselection so one view always stays active.
    if (value === 'state' || value === 'default')
      viewTypeState.value = value
  },
})

const viewOptions = computed(() => [
  ...props.state.options?.length
    ? [{ value: 'state', label: 'Rule options', icon: 'i-ph-sliders-duotone' }]
    : [],
  ...defaultOptions.value?.length
    ? [{ value: 'default', label: 'Option defaults', icon: 'i-ph-faders-duotone' }]
    : [],
])

const router = useRouter()
function goto() {
  filtersConfigs.rule = props.state.name
  router.push('/configs')
}
</script>

<template>
  <div class="p3 flex flex-col gap-2 max-w-full">
    <div class="flex flex-wrap gap-1 items-center">
      <RuleLevelIcon
        :level="state.level"
        :config-index="state.configIndex"
      />
      <span v-if="state.level === 'off'" class="color-muted ml1">Turned </span>
      <span v-else class="color-muted ml1">Set to </span>
      <span class="font-mono" :class="colors[state.level]">{{ state.level }}</span>
      <template v-if="!isLocal">
        <span class="color-muted">in</span>
        <button class="color-muted hover:color-base!" @click="goto()">
          <ColorizedConfigName
            v-if="config.name" :name="config.name"
            class="badge font-mono px2"
          />
          <span class="color-muted"> the </span>
          {{ nth(state.configIndex + 1) }}
          <span class="color-muted"> config item </span>
        </button>
      </template>
      <div v-else class="color-muted">
        in this config
      </div>
    </div>
    <div v-if="!isLocal" class="flex gap-2">
      <template v-if="config.files">
        <div class="i-ph-file-magnifying-glass-duotone my1 op75 flex-none" />
        <div class="flex flex-col gap-2">
          <div class="color-muted">
            Applies to files matching
          </div>
          <div class="flex flex-wrap gap-2 items-center">
            <GlobItem v-for="entry, idx of config.files" :key="idx" :glob="entry" />
          </div>
        </div>
      </template>
      <template v-else-if="config.rules">
        <div class="i-ph-files-duotone my1 op75 flex-none" />
        <div class="color-muted">
          Applied generally for all files
        </div>
      </template>
    </div>
    <template v-if="state.options?.length || defaultOptions?.length">
      <ActionToggleGroup
        v-if="viewOptions.length > 1"
        v-model="viewType"
        :options="viewOptions"
      />
      <template v-if="viewTypeState === 'state'">
        <Shiki
          v-for="options, idx of comparedOptions.options"
          :key="idx"
          lang="ts"
          :code="stringifyOptions(options)"
          class="text-sm p2 rounded bg-code of-auto"
        />
      </template>
      <template v-if="viewTypeState === 'default'">
        <Shiki
          v-for="options, idx of defaultOptions"
          :key="idx"
          lang="ts"
          :code="stringifyOptions(options)"
          class="text-sm p2 rounded bg-code of-auto"
        />
      </template>
    </template>
    <template v-if="viewTypeState === 'state' && comparedOptions.hasRedundantOptions">
      <div class="color-muted">
        Options <span class="op75 italic">italicized</span> match the default for the rule
      </div>
    </template>
  </div>
</template>
