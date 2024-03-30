<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { getRuleLevel } from '../composables/rules'
import type { RuleConfigStates, RuleLevel } from '../composables/types'
import type { RuleInfo } from '~/composables/types'

const props = defineProps<{
  rule: RuleInfo
  ruleStates?: RuleConfigStates
  value?: any
  class?: string
  gridView?: boolean
}>()

const emit = defineEmits<{
  badgeClick: [MouseEvent]
  stateClick: [RuleLevel]
}>()

const { copy } = useClipboard()

function capitalize(str?: string) {
  if (!str)
    return str
  return str[0].toUpperCase() + str.slice(1)
}
</script>

<template>
  <div
    v-if="ruleStates"
    flex="~ items-center gap-0.5 justify-end" text-lg
    :class="gridView ? 'absolute top-2 right-2 flex-col' : ''"
  >
    <template v-for="s, idx of ruleStates" :key="idx">
      <VDropdown>
        <RuleLevelIcon
          :level="s.level"
          :config-index="s.configIndex"
        />
        <template #popper="{ shown }">
          <RuleStateItem v-if="shown" :state="s" />
        </template>
      </VDropdown>
    </template>
  </div>

  <div
    v-if="value != null"
    :class="[props.class, gridView ? 'absolute top-2 right-2 flex-col' : '']"
  >
    <RuleLevelIcon
      :level="getRuleLevel(value)!"
      :class="getRuleLevel(value) === 'error' ? '' : ''"
    />
  </div>

  <div :class="props.class">
    <VDropdown inline-block>
      <ColorizedRuleName
        :name="rule.name"
        :prefix="rule.plugin"
        :deprecated="rule.deprecated"
        :borderless="gridView"
        :break="gridView"
        text-start
        as="button"
        @click="e => emit('badgeClick', e)"
      />
      <template #popper="{ shown }">
        <div v-if="shown" max-h="50vh">
          <div flex="~ items-center gap-2" p3>
            <NuxtLink
              action-button
              :to="rule.docs?.url" target="_blank" rel="noopener noreferrer"
              title="Docs"
            >
              <div i-ph-book-duotone />
              Docs
            </NuxtLink>
            <button
              action-button
              title="Copy"
              @click="copy(rule.name)"
            >
              <div i-ph-copy-duotone />
              Copy name
            </button>
            <slot name="popup-actions" />
          </div>
          <slot name="popup" />
        </div>
      </template>
    </VDropdown>
  </div>

  <div v-if="!gridView">
    <div v-if="rule.fixable" title="Fixable" i-ph-wrench-duotone mx2 op25 />
  </div>

  <div :class="props.class" flex="~ gap-2 items-center">
    <div
      :class="[
        rule.deprecated ? 'line-through' : '',
        gridView ? 'op50 text-sm' : 'op75 ws-nowrap of-hidden text-ellipsis line-clamp-1',
      ]"
    >
      {{ capitalize(rule.docs?.description) }}
    </div>
    <div v-if="!gridView && rule.deprecated" border="~ red/25 rounded" bg-red:5 px1 text-xs text-red>
      DEPRECATED
    </div>
  </div>

  <div v-if="gridView && rule.deprecated" flex-auto justify-end flex flex-col items-start>
    <div border="~ red/25 rounded" bg-red:5 px1 text-xs text-red>
      DEPRECATED
    </div>
  </div>
</template>
