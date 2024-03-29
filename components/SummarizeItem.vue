<script setup lang="ts">
const props = defineProps<{
  icon: string
  number: number
  color: string
  title: string
}>()
</script>

<template>
  <div flex="~ gap-2" :title="`${props.number} ${props.title}`" :class="props.number ? props.color : 'op35'">
    <div :class="props.icon" />
    <span min-w-6 :class="`text-${props.color}`">{{ props.number || '-' }}</span>
  </div>
</template>
