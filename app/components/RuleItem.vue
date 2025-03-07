<script setup lang="ts">
import type { RuleConfigStates, RuleInfo, RuleLevel } from '~~/shared/types'
import { useClipboard } from '@vueuse/core'
import { vTooltip } from 'floating-vue'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'
import { deepCompareOptions } from '~/composables/options'
import { getRuleDefaultOptions } from '~/composables/payload'

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

function redundantOptions(options: any) {
  const { hasRedundantOptions } = deepCompareOptions(options ?? [], getRuleDefaultOptions(props.rule.name))
  return hasRedundantOptions
}

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
          :has-options="!!s.options?.length"
          :has-redundant-options="redundantOptions(s.options)"
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
      :has-options="!!getRuleOptions(value)?.length"
      :has-redundant-options="redundantOptions(getRuleOptions(value))"
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
              v-if="!rule.invalid"
              btn-action-sm
              :to="rule.docs?.url" target="_blank" rel="noopener noreferrer"
              title="Docs"
            >
              <div i-ph-book-duotone />
              Docs
            </NuxtLink>
            <button
              btn-action-sm
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

  <div v-if="!gridView" grid="~ cols-2 items-center gap1" mx2>
    <div
      v-if="rule.docs?.recommended"
      v-tooltip="'✅ Recommended'"
      i-ph-check-square-duotone op50
    />
    <div v-else />

    <div
      v-if="rule.fixable"
      v-tooltip="'🔧 Fixable'"
      i-ph-wrench-duotone op50
    />
    <div v-else />
  </div>

  <div :class="props.class" flex="~ gap-2 items-center">
    <div
      :class="[
        rule.deprecated ? 'line-through' : '',
        rule.invalid ? 'text-red' : '',
        gridView ? 'op50 text-sm' : 'op75 ws-nowrap of-hidden text-ellipsis line-clamp-1',
      ]"
    >
      {{ rule.invalid ? 'Invalid rule has no description' : capitalize(rule.docs?.description) }}
    </div>
    <div v-if="!gridView && (rule.invalid || rule.deprecated)" border="~ red/25 rounded" bg-red:5 px1 text-xs text-red>
      {{ rule.invalid ? 'INVALID' : 'DEPRECATED' }}
    </div>
  </div>

  <div
    v-if="gridView && (rule.invalid || rule.deprecated || rule.fixable || rule.docs?.recommended)"
    flex flex-auto flex-col items-start justify-end
  >
    <div flex="~ gap-2" mt1>
      <div v-if="rule.invalid || rule.deprecated" border="~ red/25 rounded" bg-red:5 px1 text-xs text-red>
        {{ rule.invalid ? 'INVALID' : 'DEPRECATED' }}
      </div>
      <div
        v-if="rule.docs?.recommended"
        v-tooltip="'✅ Recommended'"
        i-ph-check-square-duotone op50
      />
      <div
        v-if="rule.fixable"
        v-tooltip="'🔧 Fixable'"
        i-ph-wrench-duotone op50
      />
    </div>
  </div>
</template>
