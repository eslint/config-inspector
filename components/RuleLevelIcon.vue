<script setup lang="ts">
import { computed } from 'vue'
import type { RuleLevel } from '~/composables/types'
import { nth } from '~/composables/strings'

const props = defineProps<{
  level: RuleLevel
  configIndex?: number
  class?: string
}>()

const title = computed(() => {
  if (props.configIndex == null)
    return `Enabled as '${props.level}'`
  return `Enabled as '${props.level}', in the ${nth(props.configIndex + 1)} config item`
})
</script>

<template>
  <div
    v-if="level === 'error'" i-ph-warning-circle-duotone text-red op80
    :title="title" :class="props.class"
  />
  <div
    v-if="level === 'warn'" i-ph-warning-duotone text-yellow5 op80 dark:text-yellow4
    :title="title" :class="props.class"
  />
  <div
    v-if="level === 'off'" i-ph-circle-half-tilt-duotone text-gray op50
    :title="title" :class="props.class"
  />
</template>
