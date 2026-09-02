<script setup lang="ts">
import { computed } from 'vue'
import { formatDuration } from '~/composables/strings'

const props = defineProps<{
  /** Time of this row in ms */
  time: number
  /** The largest time among sibling rows, scales the bar */
  max: number
  /** Sum of all rows, for the percentage label */
  total: number
  /** Bar fill color (any CSS color) */
  color?: string
}>()

const barWidth = computed(() => props.max > 0 ? `${(props.time / props.max) * 100}%` : '0%')
const percentage = computed(() => props.total > 0 ? (props.time / props.total) * 100 : 0)
</script>

<template>
  <div relative border="~ base rounded" of-hidden px2 py0.5 text-sm>
    <div
      absolute bottom-0 left-0 top-0
      :style="{ width: barWidth, backgroundColor: color ?? 'var(--stats-bar-color, #8080F2)', opacity: 0.15 }"
    />
    <div relative flex="~ gap-2 items-center justify-between">
      <div min-w-0 flex="~ gap-2 items-center" of-hidden>
        <slot />
      </div>
      <div flex="~ gap-2 items-center" flex-none font-mono>
        <span text-xs color-faint>{{ percentage.toFixed(1) }}%</span>
        <span min-w-18 text-right color-muted>{{ formatDuration(time) }}</span>
      </div>
    </div>
  </div>
</template>
