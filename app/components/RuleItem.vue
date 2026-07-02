<script setup lang="ts">
import type { RuleConfigStates, RuleInfo, RuleLevel } from '~~/shared/types'
import OverlayDropdown from '@antfu/design/components/Overlay/OverlayDropdown.vue'
import OverlayDropdownItem from '@antfu/design/components/Overlay/OverlayDropdownItem.vue'
import OverlayDropdownSeparator from '@antfu/design/components/Overlay/OverlayDropdownSeparator.vue'
import OverlayHoverCard from '@antfu/design/components/Overlay/OverlayHoverCard.vue'
import OverlayTooltip from '@antfu/design/components/Overlay/OverlayTooltip.vue'
import { useClipboard } from '@vueuse/core'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'
import ColorizedRuleName from '~/components/ColorizedRuleName.vue'
import RuleDeprecatedInfo from '~/components/RuleDeprecatedInfo.vue'
import RuleLevelIcon from '~/components/RuleLevelIcon.vue'
import RuleStateItem from '~/components/RuleStateItem.vue'
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

function openDocs() {
  if (props.rule.docs?.url)
    window.open(props.rule.docs.url, '_blank', 'noopener,noreferrer')
}

function capitalize(str?: string) {
  if (!str)
    return str
  return str[0]!.toUpperCase() + str.slice(1)
}
</script>

<template>
  <div
    v-if="ruleStates"
    class="text-lg flex gap-0.5 items-center justify-end"
    :class="gridView ? 'absolute top-2 right-2 flex-col' : ''"
  >
    <template v-for="s, idx of ruleStates" :key="idx">
      <OverlayHoverCard placement="bottom">
        <template #trigger>
          <RuleLevelIcon
            :level="s.level"
            :config-index="s.configIndex"
            :has-options="!!s.options?.length"
            :has-redundant-options="redundantOptions(s.options)"
          />
        </template>
        <RuleStateItem :state="s" />
      </OverlayHoverCard>
    </template>
  </div>

  <div
    v-if="value != null"
    :class="[props.class, gridView ? 'absolute top-2 right-2 flex-col' : '']"
  >
    <RuleLevelIcon
      :level="getRuleLevel(value)"
      :has-options="!!getRuleOptions(value)?.length"
      :has-redundant-options="redundantOptions(getRuleOptions(value))"
    />
  </div>

  <div :class="props.class">
    <OverlayDropdown align="start">
      <template #trigger>
        <ColorizedRuleName
          :name="rule.name"
          :prefix="rule.plugin"
          :deprecated="rule.deprecated"
          :borderless="gridView"
          :break="gridView"
          class="text-start"
          as="button"
          @click="(e: MouseEvent) => emit('badgeClick', e)"
        />
      </template>
      <OverlayDropdownItem
        v-if="!rule.invalid && rule.docs?.url"
        icon="i-ph-book-duotone"
        @select="openDocs"
      >
        Docs
      </OverlayDropdownItem>
      <OverlayDropdownItem
        icon="i-ph-copy-duotone"
        @select="copy(rule.name)"
      >
        Copy name
      </OverlayDropdownItem>
      <slot name="popup-actions" />
      <OverlayDropdownSeparator />
      <div class="max-h-50vh max-w-2xl of-auto">
        <slot name="popup" />
      </div>
    </OverlayDropdown>
  </div>

  <div v-if="!gridView" class="mx2 gap1 grid grid-cols-2 items-center">
    <OverlayTooltip v-if="rule.docs?.recommended" content="✅ Recommended">
      <div class="i-ph-check-square-duotone op50" />
    </OverlayTooltip>
    <div v-else />

    <OverlayTooltip v-if="rule.fixable" content="🔧 Fixable">
      <div class="i-ph-wrench-duotone op50" />
    </OverlayTooltip>
    <div v-else />
  </div>

  <div :class="props.class" class="flex gap-2 items-center of-hidden">
    <div
      :class="[
        rule.deprecated ? 'line-through' : '',
        rule.invalid ? 'color-scale-critical' : '',
        gridView ? 'color-muted text-sm' : 'color-muted ws-nowrap of-hidden text-ellipsis line-clamp-1',
      ]"
    >
      {{ rule.invalid ? 'Invalid rule has no description' : capitalize(rule.docs?.description) }}
    </div>
    <RuleDeprecatedInfo
      v-if="!gridView && (rule.invalid || rule.deprecated)"
      :deprecated="rule.deprecated"
      :invalid="rule.invalid"
    />
  </div>

  <div
    v-if="gridView && (rule.invalid || rule.deprecated || rule.fixable || rule.docs?.recommended)"
    class="flex flex-auto flex-col items-start justify-end"
  >
    <div class="mt1 flex gap-2">
      <RuleDeprecatedInfo
        v-if="rule.invalid || rule.deprecated"
        :deprecated="rule.deprecated"
        :invalid="rule.invalid"
      />
      <OverlayTooltip v-if="rule.docs?.recommended" content="✅ Recommended">
        <div class="i-ph-check-square-duotone op50" />
      </OverlayTooltip>
      <OverlayTooltip v-if="rule.fixable" content="🔧 Fixable">
        <div class="i-ph-wrench-duotone op50" />
      </OverlayTooltip>
    </div>
  </div>
</template>
