<script setup lang="ts">
import DisplayBadge from '@antfu/design/components/Display/DisplayBadge.vue'
import OverlayTooltip from '@antfu/design/components/Overlay/OverlayTooltip.vue'

const props = defineProps<{
  icon: string
  number: number
  /** A palette color name, e.g. `yellow`, `teal`. */
  color: string
  title: string
}>()
</script>

<template>
  <OverlayTooltip :content="`${props.number} ${props.title}`">
    <DisplayBadge
      :color="props.number ? props.color : false"
      :icon="props.icon"
      :class="props.number ? '' : 'op-mute'"
      class="font-mono min-w-11 tabular-nums"
    >
      {{ props.number || '' }}
    </DisplayBadge>
  </OverlayTooltip>
</template>
