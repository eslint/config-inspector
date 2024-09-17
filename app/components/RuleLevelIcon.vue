<script setup lang="ts">
import type { RuleLevel } from '~~/shared/types'
import { computed } from 'vue'
import { nth } from '~/composables/strings'

const props = defineProps<{
  level: RuleLevel
  hasOptions?: boolean
  configIndex?: number
  class?: string
}>()

const title = computed(() => {
  if (props.configIndex == null)
    return `Enabled as '${props.level}'`
  return `Enabled as '${props.level}', in the ${nth(props.configIndex + 1)} config item`
})

const color = computed(() => ({
  error: 'text-red op80',
  warn: 'text-yellow5 op80 dark:text-yellow4',
  off: 'text-gray op50',
}[props.level]))

const icon = computed(() => ({
  error: 'i-ph-warning-circle-duotone',
  warn: 'i-ph-warning-duotone',
  off: 'i-ph-circle-half-tilt-duotone',
}[props.level]))
</script>

<template>
  <div relative :class="[color, props.class]" :title="title">
    <div :class="icon" />
    <div v-if="hasOptions" absolute right--2px top--2px h-6px w-6px rounded-full bg-current op75 />
  </div>
</template>
