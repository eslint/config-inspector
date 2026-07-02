<script setup lang="ts">
import type { FileIconRule } from '@antfu/design/utils/icon'
import DisplayFileIcon from '@antfu/design/components/Display/DisplayFileIcon.vue'
import { defaultFileIconRules } from '@antfu/design/utils/icon'
import { useRouter } from '#app/composables/router'
import { filtersConfigs } from '~/composables/state'

const props = defineProps<{
  filepath: string
}>()

// @unocss-include
const fileIconRules: FileIconRule[] = [
  { match: /eslint\.config\.\w+$/, name: 'eslint', icon: 'i-catppuccin:eslint' },
  { match: /\.svelte$/, name: 'svelte', icon: 'i-catppuccin:svelte' },
  ...defaultFileIconRules,
]

const router = useRouter()
function searchFile() {
  filtersConfigs.filepath = props.filepath
  filtersConfigs.rule = undefined
  router.push(`/configs`)
}
</script>

<template>
  <div class="flex gap-2 items-center" data-testid="file-item">
    <DisplayFileIcon :path="filepath" :rules="fileIconRules" class="flex-none h-1em translate-y-1px" />
    <button class="color-muted hover:color-base hover:underline" @click="searchFile">
      {{ filepath }}
    </button>
  </div>
</template>
