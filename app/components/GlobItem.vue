<script setup lang="ts">
import type { FlatConfigItem, GlobEntry } from '~~/shared/types'
import { Dropdown as VDropdown } from 'floating-vue'
import { computed, defineComponent } from 'vue'
import { useRouter } from '#app/composables/router'
import { payload } from '~/composables/payload'
import { filtersConfigs } from '~/composables/state'
import { isDark } from '../composables/dark'
import { sanitizeHtml, shiki } from '../composables/shiki'

const props = withDefaults(
  defineProps<{
    glob: GlobEntry
    popup?: 'files' | 'configs'
    active?: boolean | null
  }>(),
  { active: null },
)

const patterns = computed(() => Array.isArray(props.glob) ? props.glob : [props.glob])
const isCompound = computed(() => patterns.value.length > 1)

function highlight(code: string): string {
  if (!shiki.value)
    return sanitizeHtml(code)
  return shiki.value.codeToHtml(code, {
    lang: 'glob',
    theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
    structure: 'inline',
  })
}

const highlightedPatterns = computed(() => patterns.value.map(highlight))

const showsPopup = computed(() => (props.popup === 'files' && payload.value.filesResolved) || props.popup === 'configs')

const files = computed<Set<string> | undefined>(() => {
  if (props.popup !== 'files')
    return undefined
  const globToFiles = payload.value.filesResolved?.globToFiles
  if (!globToFiles)
    return undefined
  // For a compound (AND) entry, the matching files are the intersection of
  // each pattern's matches.
  const sets = patterns.value.map(p => globToFiles.get(p))
  if (sets.length === 0 || sets.some(s => !s))
    return new Set()
  const resolved = sets as Set<string>[]
  if (resolved.length === 1)
    return resolved[0]
  const first = resolved[0]!
  return new Set([...first].filter(f => resolved.slice(1).every(s => s.has(f))))
})

const configs = computed<FlatConfigItem[] | undefined>(() => {
  if (props.popup !== 'configs')
    return undefined
  if (isCompound.value) {
    return payload.value.configs.filter((c) => {
      if (!c.files)
        return false
      const flat = c.files.flat()
      return patterns.value.every(p => flat.includes(p))
    })
  }
  return payload.value.globToConfigs.get(patterns.value[0]!)
})

const router = useRouter()
function goToConfig(idx: number) {
  filtersConfigs.filepath = ''
  router.push(`/configs?index=${idx + 1}`)
}

const Noop = defineComponent({ setup: (_, { slots }) => () => slots.default?.() })
</script>

<template>
  <component :is="showsPopup ? VDropdown : Noop">
    <component
      :is="showsPopup ? 'button' : 'div'"
      text-gray font-mono
      :class="active === true ? 'badge-active' : active === false ? 'badge op50' : 'badge'"
    >
      <template v-for="html, i of highlightedPatterns" :key="i">
        <span v-if="i > 0" mx1 op50>&amp;</span>
        <span class="filter-hue-rotate-180" v-html="html" />
      </template>
    </component>
    <template #popper="{ shown, hide }">
      <div v-if="shown && popup === 'files'" max-h="30vh" min-w-80 of-auto p3>
        <div v-if="isCompound" mb2 text-xs op60>
          Compound glob (intersection of {{ patterns.length }} patterns)
        </div>
        <div v-if="files?.size" flex="~ col gap-1">
          <div>Files that matches this glob</div>
          <FileItem
            v-for="file of files" :key="file"
            :filepath="file"
            font-mono
            @click="hide()"
          />
        </div>
        <div v-else text-center italic op50>
          No files matched this glob.
        </div>
      </div>

      <div v-if="shown && popup === 'configs'" max-h="30vh" min-w-80 of-auto p3>
        <div v-if="isCompound" mb2 text-xs op60>
          Compound glob (intersection of {{ patterns.length }} patterns)
        </div>
        <div v-if="configs?.length" flex="~ col gap-1">
          <div>Configs that contains this glob</div>
          <div v-for="config of configs" :key="config.name" flex="~ gap-2">
            <button
              btn-badge
              @click="goToConfig(config.index)"
            >
              <ColorizedConfigName :name="config.name" :index="config.index" />
            </button>
          </div>
        </div>
        <div v-else text-center italic op50>
          No configs matched this glob.
        </div>
      </div>
    </template>
  </component>
</template>
