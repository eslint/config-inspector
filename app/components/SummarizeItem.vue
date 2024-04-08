<script setup lang="ts">
const props = defineProps<{
  icon: string
  number: number
  color: string
  title: string
}>()
</script>

<template>
  <div
    v-tooltip="`${props.number} ${props.title}`"
    flex="~ gap-2"
    :class="props.number ? props.color : 'op25'"
  >
    <div :class="props.icon" />
    <span min-w-6 :class="`text-${props.color}`">{{ props.number || '' }}</span>
  </div>
</template>
