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
      flex="inline gap-2 items-center" mr1
    >
      <img src="/favicon.svg" inline-block h-1em> ESLint Config Inspector
    </a>
    <a
      v-if="showVersion"
      ml1 inline-block translate-y--5 text-0.6em font-200 font-mono op50
      :href="`https://github.com/eslint/config-inspector/releases/tag/v${version}`" target="_blank"
    >
      v{{ version }}
    </a>
  </div>
</template>
