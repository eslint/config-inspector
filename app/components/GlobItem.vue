<script setup lang="ts">
import type { FlatConfigItem, GlobEntry } from '~~/shared/types'
import OverlayHoverCard from '@antfu/design/components/Overlay/OverlayHoverCard.vue'
import { computed } from 'vue'
import { useRouter } from '#app/composables/router'
import ColorizedConfigName from '~/components/ColorizedConfigName'
import FileItem from '~/components/FileItem.vue'
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

const badgeClass = computed(() => props.active === true
  ? 'badge-active'
  : props.active === false
    ? 'badge op50'
    : 'badge')

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
</script>

<template>
  <OverlayHoverCard v-if="showsPopup" placement="bottom" align="start">
    <template #trigger>
      <button data-a11y-skip class="font-mono" :class="badgeClass">
        <template v-for="html, i of highlightedPatterns" :key="i">
          <span v-if="i > 0" class="color-muted mx1">&amp;</span>
          <span class="filter-hue-rotate-180" v-html="html" />
        </template>
      </button>
    </template>

    <div v-if="popup === 'files'" class="max-h-30vh min-w-80 of-auto">
      <div v-if="isCompound" class="text-xs color-muted mb2">
        Compound glob (intersection of {{ patterns.length }} patterns)
      </div>
      <div v-if="files?.size" class="flex flex-col gap-1">
        <div>Files that matches this glob</div>
        <FileItem
          v-for="file of files" :key="file"
          :filepath="file"
          class="font-mono"
        />
      </div>
      <div v-else class="color-muted text-center italic">
        No files matched this glob.
      </div>
    </div>

    <div v-if="popup === 'configs'" class="max-h-30vh min-w-80 of-auto">
      <div v-if="isCompound" class="text-xs color-muted mb2">
        Compound glob (intersection of {{ patterns.length }} patterns)
      </div>
      <div v-if="configs?.length" class="flex flex-col gap-1">
        <div>Configs that contains this glob</div>
        <div v-for="config of configs" :key="config.name" class="flex gap-2">
          <button
            class="badge hover:bg-active"
            @click="goToConfig(config.index)"
          >
            <ColorizedConfigName :name="config.name" :index="config.index" />
          </button>
        </div>
      </div>
      <div v-else class="color-muted text-center italic">
        No configs matched this glob.
      </div>
    </div>
  </OverlayHoverCard>
  <div v-else data-a11y-skip class="font-mono" :class="badgeClass">
    <template v-for="html, i of highlightedPatterns" :key="i">
      <span v-if="i > 0" class="color-muted mx1">&amp;</span>
      <span class="filter-hue-rotate-180" v-html="html" />
    </template>
  </div>
</template>
