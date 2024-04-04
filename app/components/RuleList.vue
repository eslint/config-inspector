<script setup lang="ts">
import { Fragment, computed, defineComponent, h } from 'vue'
import type { Linter } from 'eslint'
import { isGridView } from '../composables/state'
import { getRuleFromName, payload } from '~/composables/payload'
import type { RuleInfo } from '~~/types'

const props = defineProps<{
  rules: RuleInfo[] | Record<string, Linter.RuleEntry>
  getBind?: (ruleName: string) => Record<string, any>
  filter?: (ruleName: string) => boolean
}>()

const names = computed(() => Array.isArray(props.rules) ? props.rules.map(i => i.name) : Object.keys(props.rules))
const getRule = function (name: string) {
  return Array.isArray(props.rules)
    ? props.rules.find(i => i.name === name)
    : getRuleFromName(name)!
}
const getValue = function (name: string) {
  return Array.isArray(props.rules)
    ? undefined
    : props.rules[name]
}

const containerClass = computed(() => {
  if (isGridView.value) {
    return 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,350px),1fr))] gap-2'
  }
  else {
    if (Array.isArray(props.rules))
      return 'grid grid-cols-[max-content_max-content_max-content_1fr] gap-x-2 gap-y-2 items-center'
    else
      return 'grid grid-cols-[max-content_max-content_max-content_1fr] gap-x-2 gap-y-2 items-center'
  }
})

const Wrapper = defineComponent({
  setup(_, { slots }) {
    return () => isGridView.value
      ? h('div', { class: 'relative border border-base max-w-full rounded-lg p4 py3 flex flex-col gap-2 of-hidden justify-start' }, slots.default?.())
      : h(Fragment, slots.default?.())
  },
})
</script>

<template>
  <div :class="containerClass">
    <template
      v-for="name in names"
      :key="name"
    >
      <Wrapper v-if="props.filter?.(name) !== false">
        <RuleItem
          :rule="getRule(name)!"
          :rule-states="Array.isArray(rules) ? payload.ruleStateMap.get(name) || [] : undefined"
          :grid-view="isGridView"
          :value="getValue(name)"
          v-bind="getBind?.(name)"
        >
          <template #popup>
            <slot name="popup" :rule-name="name" :value="getValue(name)">
              <RuleStateItem
                v-for="state, idx of payload.ruleStateMap.get(name) || []"
                :key="idx"
                border="t base"
                :state="state"
              />
            </slot>
          </template>
          <template #popup-actions>
            <slot name="popup-actions" :rule-name="name" />
          </template>
        </RuleItem>
      </Wrapper>
    </template>
  </div>
</template>
