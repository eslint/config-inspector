<script setup lang="ts">
import type { Linter } from 'eslint'
import type { FuseResultMatch } from 'fuse.js'
import type { ComponentPublicInstance, PropType, VNode } from 'vue'
import type { FlatConfigItem, MatchedFile } from '~~/shared/types'
import ActionButton from '@antfu/design/components/Action/ActionButton.vue'
import ActionToggleGroup from '@antfu/design/components/Action/ActionToggleGroup.vue'
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import FormCheckbox from '@antfu/design/components/Form/FormCheckbox.vue'
import FormSearchField from '@antfu/design/components/Form/FormSearchField.vue'
import { watchDebounced } from '@vueuse/core'
import Fuse from 'fuse.js'
import { computed, defineComponent, h, nextTick, onMounted, ref, shallowRef, watch, watchEffect } from 'vue'
import { isIgnoreOnlyConfig, matchFile } from '~~/shared/configs'
import { getRuleLevel } from '~~/shared/rules'
import { definePageMeta } from '#app/composables/pages'
import { useRoute } from '#app/composables/router'
import ColorizedRuleName from '~/components/ColorizedRuleName.vue'
import ConfigItem from '~/components/ConfigItem.vue'
import GlobItem from '~/components/GlobItem.vue'
import RuleList from '~/components/RuleList.vue'
import { payload } from '~/composables/payload'
import { configsOpenState, filtersConfigs as filters, stateStorage } from '~/composables/state'

definePageMeta({
  scrollToTop(to) {
    return !('index' in to.query)
  },
})

const input = ref(filters.filepath)

function expandAll() {
  configsOpenState.value = configsOpenState.value.map(() => true)
}

function collapseAll() {
  configsOpenState.value = configsOpenState.value.map(() => false)
}

const filteredConfigs = shallowRef<FlatConfigItem[]>([])
const fileMatchResult = shallowRef<MatchedFile | null>(null)

watchEffect(() => {
  let configs = payload.value.configs

  if (filters.filepath) {
    fileMatchResult.value = matchFile(
      filters.filepath,
      payload.value.configs,
      payload.value.meta.basePath,
    )
    if (fileMatchResult.value.configs.length) {
      configs = Array.from(new Set([
        ...fileMatchResult.value.configs,
        ...payload.value.configsGeneral.filter(i => !isIgnoreOnlyConfig(i)).map(i => i.index),
      ]))
        .sort((a, b) => a - b)
        .map(idx => payload.value.configs[idx]!)
    }
    else {
      configs = []
    }
  }
  else {
    fileMatchResult.value = null
  }

  if (filters.rule)
    configs = configs.filter(config => filters.rule! in (config.rules || {}))

  filteredConfigs.value = configs
})

const autoCompleteFuse = computed(() => {
  return new Fuse(payload.value.filesResolved?.list || [], {
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
  if (!autoCompleteOpen.value)
    return
  input.value = filters.filepath = autoCompleteFiles.value[idx]?.item || filters.filepath
  autoCompleteOpen.value = false
}

function autoCompleteBlur() {
  setTimeout(() => {
    autoCompleteOpen.value = false
  }, 100)
}

function autoCompleteMove(delta: number) {
  if (!autoCompleteOpen.value)
    return
  autoCompleteIndex.value += delta
  if (autoCompleteIndex.value < 0)
    autoCompleteIndex.value += autoCompleteFiles.value.length
  if (autoCompleteIndex.value >= autoCompleteFiles.value.length)
    autoCompleteIndex.value -= autoCompleteFiles.value.length
}

const viewFileMatchType = computed<string | string[] | undefined>({
  get: () => stateStorage.value.viewFileMatchType,
  set: (value) => {
    // Ignore deselection so one view always stays active.
    if (value === 'configs' || value === 'merged')
      stateStorage.value.viewFileMatchType = value
  },
})

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
          array.push(h('span', { class: 'color-muted' }, content.slice(start, from)))
        array.push(h('span', { class: 'text-purple-700 dark:text-purple-300 font-bold' }, content.slice(from, to + 1)))
        start = to + 1
      }
      if (start < content.length)
        array.push(h('span', { class: 'color-muted' }, content.slice(start)))
      return array
    })
  },
})

watchDebounced(
  () => input.value,
  () => {
    filters.filepath = input.value
    autoCompleteIndex.value = 0
  },
  { debounce: 200 },
)

watch(
  () => filters.filepath,
  () => {
    if (filters.filepath !== input.value)
      input.value = filters.filepath
  },
  { flush: 'sync' },
)

const configEls = new Map<number, HTMLElement>()

const route = useRoute()
onMounted(async () => {
  if (route.query.index != null) {
    const index = Number(route.query.index) - 1
    configsOpenState.value = configsOpenState.value.map((_, idx) => idx === index)
    await nextTick()
    configEls.get(index)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<template>
  <div>
    <div class="py4 flex flex-col gap-3">
      <div class="flex relative">
        <FormSearchField
          v-model="input"
          placeholder="Test matching with filepath..."
          :class="input ? 'font-mono' : ''"
          class="w-full"
          @focusin="autoCompleteOpen = true"
          @focusout="autoCompleteBlur"
          @keydown.esc="autoCompleteOpen = false"
          @keydown.down.prevent="autoCompleteMove(1)"
          @keydown.up.prevent="autoCompleteMove(-1)"
          @keydown.enter.prevent="autoCompleteConfirm()"
        />
        <div
          v-show="autoCompleteOpen && autoCompleteFiles.length"
          class="mt1 py1 border border-base rounded-lg bg-glass:75 flex flex-col max-h-80 shadow-lg left-8 right-8 top-1/1 absolute z-dropdown of-auto"
        >
          <button
            v-for="file, idx of autoCompleteFiles"
            :key="file.item"
            :class="idx === autoCompleteIndex ? 'bg-active' : ''"
            class="font-mono px3 py0.5 text-left hover:bg-active"
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
      <div v-if="filters.filepath || filters.rule" class="mb2 flex flex-wrap gap-2 items-center">
        <div v-if="filters.filepath">
          <div
            class="text-sm badge-color-purple px3 py1 rounded-full flex flex-wrap gap-2 items-center"
            :class="{ 'saturate-0': !filteredConfigs.length }"
          >
            <div class="i-ph-file-dotted-duotone" />
            <span class="op75">Filepath</span>
            <code>{{ filters.filepath }}</code>

            <template v-if="!filteredConfigs.length">
              <span class="op75">is not included or has been ignored</span>
            </template>
            <template v-else-if="stateStorage.viewFileMatchType === 'configs'">
              <span class="op75">matched with</span>
              <span class="font-mono tabular-nums">{{ filteredConfigs.length }} / {{ payload.configs.length }}</span>
              <span class="op75">config items</span>
            </template>
            <template v-else>
              <span class="op75">matched with total </span>
              <span class="font-mono tabular-nums">{{ Object.keys(mergedRules.all).length }}</span>
              <span class="op75">rules, </span>
              <span class="font-mono tabular-nums">{{ Object.keys(mergedRules.specific).length }}</span>
              <span class="op75">of them are specific to the file</span>
            </template>
            <button
              class="i-ph-x text-sm op75 hover:op100"
              aria-label="Clear filepath filter"
              @click="filters.filepath = ''; input = ''"
            />
          </div>
        </div>
        <div v-if="filters.rule">
          <div class="text-sm badge-color-blue px3 py1 rounded-full flex gap-2 items-center">
            <div class="i-ph-funnel-duotone" />
            <span class="op75">Filtered by</span>
            <ColorizedRuleName :name="filters.rule" />
            <span class="op75">rule</span>
            <button
              class="i-ph-x text-sm op75 hover:op100"
              aria-label="Clear rule filter"
              @click="filters.rule = ''"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 items-center">
        <ActionToggleGroup
          v-if="filters.filepath"
          v-model="viewFileMatchType"
          :options="[
            { value: 'configs', label: 'Matched Config Items', icon: 'i-ph-stack-duotone' },
            { value: 'merged', label: 'Merged Rules', icon: 'i-ph-film-script-duotone' },
          ]"
        />

        <FormCheckbox
          v-if="filters.filepath && stateStorage.viewFileMatchType === 'configs'"
          :model-value="stateStorage.showSpecificOnly"
          class="ml2"
          @update:model-value="stateStorage.showSpecificOnly = $event"
        >
          <span class="color-muted">Show Specific Rules Only</span>
        </FormCheckbox>
        <div class="flex-auto" />
        <ActionButton class="px3" @click="expandAll">
          Expand All
        </ActionButton>
        <ActionButton class="px3" @click="collapseAll">
          Collapse All
        </ActionButton>
      </div>

      <template v-if="!filteredConfigs.length">
        <FeedbackEmptyState
          icon="i-ph-stack-duotone"
          title="No matched config items."
        />
        <template v-if="fileMatchResult?.globs.length">
          <div>Ignored by globs:</div>
          <div class="flex flex-wrap gap-2 items-center">
            <GlobItem
              v-for="glob, idx of fileMatchResult.globs"
              :key="idx"
              :glob="glob"
              popup="configs"
            />
          </div>
        </template>
      </template>
      <template v-else>
        <!-- Merged Rules -->
        <template v-if="filters.filepath && stateStorage.viewFileMatchType === 'merged'">
          <details class="flat-config-item border border-base rounded-lg relative">
            <summary class="block">
              <div class="text-sm color-base font-mono px2 py2 bg-hover flex gap-2 cursor-pointer select-none items-start">
                <div class="i-ph-caret-right transition [details[open]_&]:rotate-90" />
                Merged Rules: Common to every file ({{ Object.keys(mergedRules.common).length }} rules)
              </div>
            </summary>
            <RuleList
              class="m4"
              :rules="mergedRules.common"
            />
          </details>
          <details class="flat-config-item border border-base rounded-lg relative" open>
            <summary class="block">
              <div class="text-sm color-base font-mono px2 py2 bg-hover flex gap-2 cursor-pointer select-none items-start">
                <div class="i-ph-caret-right transition [details[open]_&]:rotate-90" />
                Merged Rules: Specific to matched file ({{ Object.keys(mergedRules.specific).length }} rules)
              </div>
            </summary>
            <template v-if="Object.keys(mergedRules.specificDisabled).length">
              <div class="px4 pt4">
                Disables ({{ Object.keys(mergedRules.specificDisabled).length }})
              </div>
              <RuleList
                class="m4"
                :get-bind="(name: string) => ({ class: 'color-muted' })"
                :rules="mergedRules.specificDisabled"
              />
            </template>
            <template v-if="Object.keys(mergedRules.specificEnabled).length">
              <div class="px4 pt4">
                Enables ({{ Object.keys(mergedRules.specificEnabled).length }})
              </div>
              <RuleList
                class="m4"
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
              v-show="filteredConfigs.includes(config) && (!filters.filepath || (!stateStorage.showSpecificOnly || config.files))"
              :ref="(el) => { configEls.set(idx, (el as ComponentPublicInstance)?.$el) }"
              v-model:open="configsOpenState[idx]"
              :config
              :index="idx"
              :filters="filters"
              :active="!!(filters.filepath && config.files)"
              :matched-globs="fileMatchResult?.globs"
              @badge-click="e => filters.rule = e"
            />
          </template>
        </template>
      </template>
    </div>
  </div>
</template>
