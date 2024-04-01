<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core'
import { computed, defineComponent, h, ref } from 'vue'
import { minimatch } from 'minimatch'
import type { Linter } from 'eslint'
import Fuse, { type FuseResultMatch } from 'fuse.js'
import type { PropType, VNode } from 'vue'
import { getRuleLevel } from '~/composables/rules'
import { filtersConfigs as filters, stateStorage } from '~/composables/state'
import { payload } from '~/composables/payload'

const opens = ref(payload.value.configs.map(() => true))
const input = ref(filters.filepath)

function expandAll() {
  opens.value = opens.value.map(() => true)
}

function collapseAll() {
  opens.value = opens.value.map(() => false)
}

function matchGlob(file: string, glob: (Linter.FlatConfigFileSpec | Linter.FlatConfigFileSpec[])[]) {
  const globs = (Array.isArray(glob) ? glob : [glob]).flat()
  return globs.some(glob => typeof glob === 'function' ? glob(file) : minimatch(file, glob))
}

const filteredConfigs = computed(() => {
  let configs = payload.value.configs

  if (filters.filepath) {
    const ignoreOnlyConfigs = configs.filter(config => !config.rules && config.ignores)
    const isIgnored = ignoreOnlyConfigs.some(config => matchGlob(filters.filepath!, config.ignores!))
    if (isIgnored)
      return []
    const isAnyIncluded = configs.some(config => matchGlob(filters.filepath!, config.files || []))
    if (!isAnyIncluded)
      return []
    configs = configs.filter((config) => {
      const isIncluded = config.files ? matchGlob(filters.filepath!, config.files) : true
      const isExcluded = config.ignores ? matchGlob(filters.filepath!, config.ignores) : false
      return isIncluded && !isExcluded
    })
  }

  if (filters.rule)
    configs = configs.filter(config => filters.rule! in (config.rules || {}))

  return configs
})

const autoCompleteFuse = computed(() => {
  return new Fuse(payload.value.files, {
    threshold: 0.3,
    includeMatches: true,
  })
})

const autoCompleteFiles = computed(() => {
  return autoCompleteFuse.value.search(filters.filepath || '')
})

const autoCompleteIndex = ref(0)
const autoCompleteOpen = ref(false)

function autoCompleteConfirm(idx = autoCompleteIndex.value) {
  input.value = filters.filepath = autoCompleteFiles.value[idx]?.item || filters.filepath
  autoCompleteOpen.value = false
}

function autoCompleteBlur() {
  setTimeout(() => {
    autoCompleteOpen.value = false
  }, 100)
}

function autoCompleteMove(delta: number) {
  autoCompleteIndex.value += delta
  if (autoCompleteIndex.value < 0)
    autoCompleteIndex.value += autoCompleteFiles.value.length
  if (autoCompleteIndex.value >= autoCompleteFiles.value.length)
    autoCompleteIndex.value -= autoCompleteFiles.value.length
}

const mergedRules = computed(() => {
  if (!filters.filepath || stateStorage.value.viewFileMatchType !== 'merged') {
    return {
      all: {},
      common: {},
      specific: {},
      specificDisabled: {},
      specificEnabled: {},
    }
  }
  const all: Record<string, Linter.RuleEntry> = {}
  const common: Record<string, Linter.RuleEntry> = {}
  const specific: Record<string, Linter.RuleEntry> = {}

  filteredConfigs.value.forEach((config) => {
    if (!config.rules)
      return
    Object.assign(all, config.rules)
    if (config.files)
      Object.assign(specific, config.rules)
    else
      Object.assign(common, config.rules)
  })
  const specificDisabled = Object.fromEntries(
    Object.entries(specific)
      .filter(([_, value]) => getRuleLevel(value) === 'off'),
  )
  const specificEnabled = Object.fromEntries(
    Object.entries(specific)
      .filter(([_, value]) => getRuleLevel(value) !== 'off'),
  )
  for (const key in all) {
    if (getRuleLevel(all[key]) === 'off')
      delete all[key]
  }
  return {
    all,
    common,
    specific,
    specificDisabled,
    specificEnabled,
  }
})

const HighlightMatch = defineComponent({
  props: {
    matches: Array as PropType<readonly FuseResultMatch[]>,
  },
  setup(props) {
    return () => props.matches?.map((match) => {
      let start = 0
      const content = match.value || ''
      const array: VNode[] = []

      for (const [from, to] of match.indices) {
        if (start < from)
          array.push(h('span', { class: 'op50' }, content.slice(start, from)))
        array.push(h('span', { class: 'text-purple font-bold' }, content.slice(from, to + 1)))
        start = to + 1
      }
      if (start < content.length)
        array.push(h('span', { class: 'op50' }, content.slice(start)))
      return array
    })
  },
})

debouncedWatch(
  () => input.value,
  () => {
    filters.filepath = input.value
    autoCompleteIndex.value = 0
  },
  { debounce: 200 },
)
</script>

<template>
  <div>
    <div flex="~ col gap-3" py4>
      <div relative flex>
        <input
          v-model="input"
          placeholder="Test matching with filepath..."
          border="~ base rounded-full"
          :class="input ? 'font-mono' : ''"
          w-full bg-transparent px3 py2 pl10 outline-none
          @focus="autoCompleteOpen = true"
          @click="autoCompleteOpen = true"
          @blur="autoCompleteBlur"
          @keydown.esc="autoCompleteOpen = false"
          @keydown.down.prevent="autoCompleteMove(1)"
          @keydown.up.prevent="autoCompleteMove(-1)"
          @keydown.enter.prevent="autoCompleteConfirm()"
        >
        <div absolute bottom-0 left-0 top-0 flex="~ items-center justify-center" p4 op50>
          <div i-ph-magnifying-glass-duotone />
        </div>
        <div
          v-show="autoCompleteOpen && autoCompleteFiles.length"
          pos="absolute left-8 right-8 top-1/1"
          border="~ base rounded"
          flex="~ col" z-1 mt--1 max-h-80 of-auto py1 shadow bg-glass
        >
          <button
            v-for="file, idx of autoCompleteFiles"
            :key="file.item" px3 py0.5 text-left font-mono
            :class="idx === autoCompleteIndex ? 'bg-active' : ''"
            hover:bg-active
            @click="autoCompleteConfirm(idx)"
          >
            <template v-if="file.matches">
              <HighlightMatch :matches="file.matches" />
            </template>
            <template v-else>
              {{ file.item }}
            </template>
          </button>
        </div>
      </div>
      <div v-if="filters.filepath || filters.rule" flex="~ gap-2 items-center wrap" mb2>
        <div v-if="filters.filepath">
          <div
            flex="~ gap-2 items-center wrap"
            border="~ purple/20 rounded-full" bg-purple:10 px3 py1
            :class="{ 'saturate-0': !filteredConfigs.length }"
          >
            <div i-ph-file-dotted-duotone text-purple />
            <span op50>Filepath</span>
            <code>{{ filters.filepath }}</code>

            <template v-if="!filteredConfigs.length">
              <span op50>is not included or has been ignored</span>
            </template>
            <template v-else-if="stateStorage.viewFileMatchType === 'configs'">
              <span op50>matched with</span>
              <span>{{ filteredConfigs.length }} / {{ payload.configs.length }}</span>
              <span op50>config items</span>
            </template>
            <template v-else>
              <span op50>matched with total </span>
              <span>{{ Object.keys(mergedRules.all).length }}</span>
              <span op50>rules, </span>
              <span>{{ Object.keys(mergedRules.specific).length }}</span>
              <span op50>of them are specific to the file</span>
            </template>
            <button
              i-ph-x text-sm op25 hover:op100
              @click="filters.filepath = ''; input = ''"
            />
          </div>
        </div>
        <div v-if="filters.rule">
          <div
            flex="~ gap-2 items-center"
            border="~ blue/20 rounded-full" bg-blue:10 px3 py1
          >
            <div i-ph-funnel-duotone />
            <span op50>Filtered by</span>
            <ColorizedRuleName :name="filters.rule" />
            <span op50>rule</span>
            <button
              i-ph-x text-sm op25 hover:op100
              @click="filters.rule = ''"
            />
          </div>
        </div>
      </div>
      <div flex="~ gap-2 items-center wrap">
        <template v-if="filters.filepath">
          <div border="~ base rounded" flex>
            <button
              :class="stateStorage.viewFileMatchType === 'configs' ? 'bg-gray:5' : 'op25'"
              flex="~ gap-2 items-center"
              px3 py1 hover:bg-gray:15
              @click="stateStorage.viewFileMatchType = stateStorage.viewFileMatchType === 'configs' ? 'merged' : 'configs'"
            >
              <div i-ph-stack-duotone />
              <span>Matched Config Items</span>
            </button>
            <div border="l base" />
            <button
              :class="stateStorage.viewFileMatchType !== 'configs' ? 'bg-gray:5' : 'op25'"
              flex="~ gap-2 items-center"
              px3 py1 hover:bg-gray:15
              @click="stateStorage.viewFileMatchType = stateStorage.viewFileMatchType === 'configs' ? 'merged' : 'configs'"
            >
              <div i-ph-film-script-duotone />
              <span>Merged Rules</span>
            </button>
          </div>
        </template>

        <label
          v-if="filters.filepath && stateStorage.viewFileMatchType === 'configs'"
          flex="~ gap-2 items-center" ml2 select-none
        >
          <input
            v-model="stateStorage.showSpecificOnly"
            type="checkbox"
          >
          <span op50>Show Specific Rules Only</span>
        </label>
        <div flex-auto />
        <button
          hover="op100! bg-active"
          px3 py1 op50 border="~ base rounded"
          flex="~ gap-2 items-center"
          @click="expandAll"
        >
          Expand All
        </button>
        <button
          hover="op100! bg-active"
          px3 py1 op50 border="~ base rounded"
          flex="~ gap-2 items-center"
          @click="collapseAll"
        >
          Collapse All
        </button>
      </div>

      <template v-if="!filteredConfigs.length">
        <div italic op50>
          No matched config items.
        </div>
      </template>
      <template v-else>
        <!-- Merged Rules -->
        <template v-if="filters.filepath && stateStorage.viewFileMatchType === 'merged'">
          <details class="flat-config-item" border="~ base rounded-lg" relative>
            <summary block>
              <div flex="~ gap-2 items-start" cursor-pointer select-none bg-hover px2 py2 text-sm font-mono op75>
                <div i-ph-caret-right class="[details[open]_&]:rotate-90" transition />
                Merged Rules: Common to every file ({{ Object.keys(mergedRules.common).length }} rules)
              </div>
            </summary>
            <RuleList
              m4
              :rules="mergedRules.common"
            />
          </details>
          <details class="flat-config-item" border="~ base rounded-lg" relative open>
            <summary block>
              <div flex="~ gap-2 items-start" cursor-pointer select-none bg-hover px2 py2 text-sm font-mono op75>
                <div i-ph-caret-right class="[details[open]_&]:rotate-90" transition />
                Merged Rules: Specific to matched file ({{ Object.keys(mergedRules.specific).length }} rules)
              </div>
            </summary>
            <template v-if="Object.keys(mergedRules.specificDisabled).length">
              <div px4 pt4>
                Disables ({{ Object.keys(mergedRules.specificDisabled).length }})
              </div>
              <RuleList
                m4
                :get-bind="(name: string) => ({ class: 'op50' })"
                :rules="mergedRules.specificDisabled"
              />
            </template>
            <template v-if="Object.keys(mergedRules.specificEnabled).length">
              <div px4 pt4>
                Enables ({{ Object.keys(mergedRules.specificEnabled).length }})
              </div>
              <RuleList
                m4
                :rules="mergedRules.specificEnabled"
              />
            </template>
          </details>
        </template>

        <!-- Flat Configs -->
        <template v-else>
          <template
            v-for="config, idx in payload.configs"
            :key="idx"
          >
            <ConfigItem
              v-show="!filters.filepath ? true : filteredConfigs.includes(config) && (!stateStorage.showSpecificOnly || config.files)"
              v-model:open="opens[idx]"
              :payload="payload"
              :config="config"
              :index="idx"
              :filters="filters"
              :active="!!(filters.filepath && config.files)"
              @badge-click="e => filters.rule = e"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>
