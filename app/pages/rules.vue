<script setup lang="ts">
import ActionButton from '@antfu/design/components/Action/ActionButton.vue'
import ActionToggleGroup from '@antfu/design/components/Action/ActionToggleGroup.vue'
import FormSearchField from '@antfu/design/components/Form/FormSearchField.vue'
import { watchDebounced } from '@vueuse/core'
import Fuse from 'fuse.js'
import { computed, ref } from 'vue'
import OptionSelectGroup from '~/components/OptionSelectGroup.vue'
import RuleLevelIcon from '~/components/RuleLevelIcon.vue'
import RuleList from '~/components/RuleList.vue'
import { getPluginColor } from '~/composables/color'
import { payload } from '~/composables/payload'
import { bpSm, filtersRules as filters, stateStorage } from '~/composables/state'

const rules = computed(() => Object.values(payload.value.rules))
const pluginNames = computed(() => Array.from(new Set(rules.value.map(i => i.plugin))).filter(Boolean))

const conditionalFiltered = computed(() => {
  let conditional = rules.value

  if (filters.plugin) {
    conditional = conditional
      .filter(rule => rule.plugin === filters.plugin)
  }

  if (filters.fixable != null) {
    conditional = conditional
      .filter(rule => !!rule.fixable === filters.fixable)
  }

  switch (filters.state) {
    case 'using':
      conditional = conditional.filter(rule => payload.value.ruleToState.get(rule.name))
      break
    case 'unused':
      conditional = conditional.filter(rule => !payload.value.ruleToState.get(rule.name))
      break
    case 'overloads':
      conditional = conditional.filter(rule => (payload.value.ruleToState.get(rule.name)?.length || 0) > 1)
      break
    case 'error':
      conditional = conditional.filter(rule => payload.value.ruleToState.get(rule.name)?.some(i => i.level === 'error'))
      break
    case 'warn':
      conditional = conditional.filter(rule => payload.value.ruleToState.get(rule.name)?.some(i => i.level === 'warn'))
      break
    case 'off':
      conditional = conditional.filter(rule => payload.value.ruleToState.get(rule.name)?.some(i => i.level === 'off'))
      break
    case 'off-only':
      conditional = conditional.filter((rule) => {
        const states = payload.value.ruleToState.get(rule.name)
        if (!states?.length)
          return false
        return states.every(i => i.level === 'off')
      })
      break
  }

  switch (filters.status) {
    case 'active':
      conditional = conditional.filter(rule => !rule.deprecated)
      break
    case 'recommended':
      conditional = conditional.filter(rule => rule.docs?.recommended)
      break
    case 'fixable':
      conditional = conditional.filter(rule => rule.fixable)
      break
    case 'deprecated':
      conditional = conditional.filter(rule => rule.deprecated)
      break
  }

  return conditional
})

const fuse = computed(() => new Fuse(conditionalFiltered.value, {
  keys: ['name', 'docs.description'],
  threshold: 0.5,
}))

const filtered = ref(conditionalFiltered.value)

watchDebounced(
  () => [filters.search, conditionalFiltered.value],
  () => {
    if (!filters.search)
      return filtered.value = conditionalFiltered.value
    filtered.value = fuse.value.search(filters.search).map(i => i.item)
  },
  { debounce: 200 },
)
const isDefaultFilters = computed(() => !(filters.search || filters.plugin || filters.state !== 'using' || filters.status !== 'active'))

const viewType = computed<string | string[] | undefined>({
  get: () => stateStorage.value.viewType,
  set: (value) => {
    // Ignore deselection so one view always stays active.
    if (value === 'list' || value === 'grid')
      stateStorage.value.viewType = value
  },
})

function resetFilters() {
  filters.search = ''
  filters.plugin = ''
  filters.state = 'using'
  filters.status = 'active'
}
</script>

<template>
  <div>
    <div class="py4 flex flex-col gap-2">
      <FormSearchField
        v-model="filters.search"
        placeholder="Search rules..."
        :class="filters.search ? 'font-mono' : ''"
        class="w-full"
      />
      <div class="my2 gap-2 grid grid-cols-[max-content_1fr] items-center">
        <div class="text-sm color-muted text-right">
          Plugins
        </div>
        <OptionSelectGroup
          v-model="filters.plugin"
          :options="['', ...pluginNames]"
          :titles="['All', ...pluginNames]"
          :props="[{}, ...pluginNames.map(i => ({
            class: 'font-mono',
            style: filters.plugin === i ? {
              color: getPluginColor(i),
              backgroundColor: getPluginColor(i, 0.1),
            } : {},
          }))]"
        />
        <div class="text-sm color-muted text-right">
          Usage
        </div>
        <OptionSelectGroup
          v-model="filters.state"
          :options="['', 'using', 'unused', 'error', 'warn', 'off', 'overloads', 'off-only']"
          :titles="['All', 'Using', 'Unused', 'Error', 'Warn', 'Off', 'Overloaded', 'Off Only']"
        >
          <template #default="{ value, title }">
            <div class="flex items-center">
              <div class="ml--1 mr-1 flex items-center">
                <RuleLevelIcon v-if="value === 'error' || value === 'overloads'" level="error" />
                <RuleLevelIcon v-if="value === 'warn' || value === 'overloads'" level="warn" />
                <RuleLevelIcon v-if="value === 'off' || value === 'off-only' || value === 'overloads'" level="off" />
              </div>
              {{ title || value }}
            </div>
          </template>
        </OptionSelectGroup>
        <div class="text-sm color-muted text-right">
          State
        </div>
        <OptionSelectGroup
          v-model="filters.status"
          :options="['', 'active', 'recommended', 'fixable', 'deprecated']"
          :titles="['All', 'Active', 'Recommended', 'Fixable', 'Deprecated']"
        >
          <template #default="{ value, title }">
            <div class="flex gap-1 items-center">
              <div v-if="value === 'recommended'" class="i-ph-check-square-duotone text-success-700 ml--0.5 dark:text-success-300" />
              <div v-if="value === 'fixable'" class="i-ph-wrench-duotone color-scale-medium ml--0.5" />
              <div v-if="value === 'deprecated'" class="i-ph-prohibit-inset-duotone color-muted ml--1" />
              {{ title || value }}
            </div>
          </template>
        </OptionSelectGroup>
      </div>
    </div>

    <div class="gap-2 items-center justify-between md:flex">
      <div class="flex gap-2 lt-sm:flex-col">
        <div class="badge-muted text-sm px3 py1 inline-flex gap-2 items-center">
          <div class="i-ph-list-checks-duotone" />
          <span class="font-mono tabular-nums">{{ filtered.length }}</span>
          <span class="color-base">rules {{ isDefaultFilters ? 'enabled' : 'filtered' }}</span>
          <span class="color-muted">out of {{ rules.length }} rules</span>
        </div>
        <ActionButton
          v-if="!isDefaultFilters"
          icon="i-ph-funnel-duotone"
          class="self-start rounded-full!"
          @click="resetFilters()"
        >
          Clear Filter
          <div class="i-ph-x text-sm color-muted ml--1" />
        </ActionButton>
      </div>

      <ActionToggleGroup
        v-if="!bpSm"
        v-model="viewType"
        :options="[
          { value: 'list', label: 'List', icon: 'i-ph-list-duotone' },
          { value: 'grid', label: 'Grid', icon: 'i-ph-grid-four-duotone' },
        ]"
      />
    </div>
    <RuleList
      class="my4"
      :rules="filtered"
      :get-bind="(name: string) => ({ class: (payload.ruleToState.get(name)?.length || filters.state === 'unused') ? '' : 'color-muted' })"
    />
  </div>
</template>
