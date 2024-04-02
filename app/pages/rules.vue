<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core'
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import { filtersRules as filters } from '~/composables/state'
import { payload } from '~/composables/payload'

const rules = computed(() => Object.values(payload.value.rules))
const pluginNames = computed(() => Array.from(new Set(rules.value.map(i => i.plugin))))

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
      conditional = conditional.filter(rule => payload.value.ruleStateMap.get(rule.name))
      break
    case 'unused':
      conditional = conditional.filter(rule => !payload.value.ruleStateMap.get(rule.name))
      break
    case 'overloads':
      conditional = conditional.filter(rule => (payload.value.ruleStateMap.get(rule.name)?.length || 0) > 1)
      break
  }

  switch (filters.status) {
    case 'active':
      conditional = conditional.filter(rule => !rule.deprecated)
      break
    case 'recommended':
      conditional = conditional.filter(rule => rule.docs?.recommended)
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

debouncedWatch(
  () => [filters.search, conditionalFiltered.value],
  () => {
    if (!filters.search)
      return filtered.value = conditionalFiltered.value
    filtered.value = fuse.value.search(filters.search).map(i => i.item)
  },
  { debounce: 200 },
)
const isDefaultFilters = computed(() => !(filters.search || filters.plugin || filters.state !== 'using' || filters.status !== 'active'))

function resetFilters() {
  filters.search = ''
  filters.plugin = ''
  filters.state = 'using'
  filters.status = 'active'
}
</script>

<template>
  <div>
    <div py4 flex="~ col gap-2">
      <div relative flex>
        <input
          v-model="filters.search"
          :class="filters.search ? 'font-mono' : ''"
          placeholder="Search rules..."
          border="~ base rounded-full"
          w-full bg-transparent px3 py2 pl10 outline-none
        >
        <div absolute bottom-0 left-0 top-0 flex="~ items-center justify-center" p4 op50>
          <div i-ph-magnifying-glass-duotone />
        </div>
      </div>
      <div grid="~ cols-[max-content_1fr] gap-2" my2 items-center>
        <div text-right text-sm op50>
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
        <div text-right text-sm op50>
          Usage
        </div>
        <OptionSelectGroup
          v-model="filters.state"
          :options="['', 'using', 'overloads', 'unused']"
          :titles="['All', 'Using', 'Overloaded', 'Unused']"
        />
        <div text-right text-sm op50>
          State
        </div>
        <OptionSelectGroup
          v-model="filters.status"
          :options="['', 'active', 'recommended', 'deprecated']"
          :titles="['All', 'Active', 'Recommended', 'Deprecated']"
        />
      </div>
    </div>

    <div flex="~ gap-2">
      <div
        flex="~ inline gap-2 items-center"
        border="~ gray/20 rounded-full" bg-gray:10 px3 py1
      >
        <div i-ph-list-checks-duotone />
        <span>{{ filtered.length }}</span>
        <span op75>rules {{ isDefaultFilters ? 'enabled' : 'filtered' }}</span>
        <span text-sm op50>out of {{ rules.length }} rules</span>
      </div>
      <button
        v-if="!isDefaultFilters"
        flex="~ inline gap-2 items-center"
        border="~ purple/20 rounded-full" bg-purple:10 px3 py1
        @click="resetFilters()"
      >
        <div i-ph-funnel-duotone text-purple />
        <span op50>Clear Filter</span>
        <button
          i-ph-x ml--1 text-sm op25 hover:op100
        />
      </button>
    </div>
    <RuleList
      my4
      :rules="filtered"
      :get-bind="(name: string) => ({ class: (payload.ruleStateMap.get(name)?.length || filters.state === 'unused') ? '' : 'op40' })"
    />
  </div>
</template>
~/app/composables/state~/app/composables/payload
