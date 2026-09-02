<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '#app/composables/router'
import { filepathIconsMap } from '~/composables/icons'
import { filtersConfigs } from '~/composables/state'

const props = defineProps<{
  filepath: string
}>()

const icon = computed(() => {
  for (const rule of filepathIconsMap) {
    if (rule.match.test(props.filepath))
      return rule.icon
  }
  return 'i-catppuccin-file'
})

const router = useRouter()
function searchFile() {
  filtersConfigs.filepath = props.filepath
  filtersConfigs.rule = undefined
  router.push(`/configs`)
}
</script>

<template>
  <div flex="~ gap-2 items-center" data-testid="file-item">
    <div :class="icon" h="1em" flex-none translate-y-1px icon-catppuccin />
    <button color-muted hover="color-base underline" @click="searchFile">
      {{ filepath }}
    </button>
  </div>
</template>
