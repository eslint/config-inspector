<script setup lang="ts">
import type { RuleLevel } from '~~/shared/types'
import { computed } from 'vue'
import { nth } from '~/composables/strings'

const props = defineProps<{
  level: RuleLevel
  hasOptions?: boolean
  hasRedundantOptions?: boolean
  configIndex?: number
  class?: string
}>()

const title = computed(() => {
  if (props.configIndex == null)
    return `Enabled as '${props.level}'`
  return `Enabled as '${props.level}', in the ${nth(props.configIndex + 1)} config item`
})

const color = computed(() => ({
  error: 'color-scale-critical op80',
  warn: 'color-scale-medium op80',
  off: 'color-scale-neutral op50',
}[props.level]))

const icon = computed(() => ({
  error: 'i-ph-warning-circle-duotone',
  warn: 'i-ph-warning-duotone',
  off: 'i-ph-circle-half-tilt-duotone',
}[props.level]))
</script>

<template>
  <div class="relative" :class="[color, props.class]" :title="title">
    <div :class="icon" />
    <div v-if="hasOptions" class="rounded-full bg-current op75 h-6px w-6px right--2px top--2px absolute" :class="hasRedundantOptions ? 'text-blue-500' : ''" />
  </div>
</template>
