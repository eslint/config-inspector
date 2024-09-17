<script setup lang="ts">
import { useRouter } from '#app/composables/router'
import { computed } from 'vue'
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
  return 'i-ph-file-duotone'
})

const router = useRouter()
function searchFile() {
  filtersConfigs.filepath = props.filepath
  filtersConfigs.rule = undefined
  router.push(`/configs`)
}
</script>

<template>
  <div flex="~ gap-2 items-center">
    <div :class="icon" flex-none h="1em" translate-y-1px />
    <button text-gray hover="underline" @click="searchFile">
      {{ filepath }}
    </button>
  </div>
</template>
