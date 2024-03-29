<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  prefix?: string
  url?: string
  as?: string
  deprecated?: boolean
  borderless?: boolean
  break?: boolean
}>()

const parsed = computed(() => {
  if (props.prefix) {
    if (props.name.startsWith(props.prefix)) {
      return {
        scope: props.prefix,
        name: props.name.slice(props.prefix.length).replace(/^\/+/, ''),
      }
    }
    else {
      return {
        scope: undefined,
        name: props.name,
      }
    }
  }
  const parts = props.name.split('/')
  if (parts.length === 1) {
    return {
      scope: undefined,
      name: parts[0],
    }
  }
  return {
    scope: parts[0],
    name: parts.slice(1).join('/'),
  }
})
</script>

<template>
  <component
    :is="as || 'div'"
    ws-nowrap font-mono of-hidden text-ellipsis
    :class="[
      deprecated ? 'line-through' : '',
      borderless ? '' : 'border border-base px2 bg-gray:5 rounded',
    ]"
  >
    <span v-if="parsed.scope" :style="{ color: getPluginColor(parsed.scope) }">{{ parsed.scope }}</span>
    <span v-if="parsed.scope" op30>/</span>
    <br v-if="parsed.scope && props.break">
    <span op75>{{ parsed.name }}</span>
  </component>
</template>
