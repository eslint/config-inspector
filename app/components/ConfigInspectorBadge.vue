<script setup lang="ts">
import { version } from '~~/package.json'

withDefaults(
  defineProps<{
    showVersion?: boolean
  }>(),
  {
    showVersion: true,
  },
)
</script>

<template>
  <div>
    <a
      href="https://github.com/eslint/config-inspector" target="_blank"
      class="mr1 inline-flex gap-2 items-center"
    >
      <img src="/favicon.svg" alt="" class="h-1em inline-block"> ESLint Config Inspector
    </a>
    <a
      v-if="showVersion"
      class="text-0.6em color-muted font-200 font-mono ml1 inline-block translate-y--5"
      :href="`https://github.com/eslint/config-inspector/releases/tag/v${version}`" target="_blank"
    >
      v{{ version }}
    </a>
  </div>
</template>
