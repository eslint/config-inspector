<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration } from '~/composables/strings'

export interface StatsBreakdownSegment {
  label: string
  time: number
  color: string
}

const props = defineProps<{
  segments: StatsBreakdownSegment[]
}>()

const total = computed(() => props.segments.reduce((sum, s) => sum + s.time, 0))
const visible = computed(() => props.segments.filter(s => s.time > 0))
</script>

<template>
  <div flex="~ col gap-2">
    <div flex="~ gap-1px" h-4 of-hidden rounded border="~ base">
      <div
        v-for="segment of visible"
        :key="segment.label"
        :style="{ width: `${(segment.time / total) * 100}%`, backgroundColor: segment.color }"
        :title="`${segment.label}: ${formatDuration(segment.time)}`"
        h-full
      />
    </div>
    <div flex="~ gap-4 items-center wrap" text-sm>
      <div v-for="segment of visible" :key="segment.label" flex="~ gap-1.5 items-center">
        <div h-2.5 w-2.5 rounded-sm :style="{ backgroundColor: segment.color }" />
        <span color-muted>{{ segment.label }}</span>
        <span font-mono>{{ formatDuration(segment.time) }}</span>
        <span text-xs color-faint font-mono>{{ ((segment.time / total) * 100).toFixed(1) }}%</span>
      </div>
    </div>
  </div>
</template>
