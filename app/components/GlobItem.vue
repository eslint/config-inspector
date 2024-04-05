<script setup lang="ts">
import type { Linter } from 'eslint'

withDefaults(
  defineProps<{
    glob: Linter.FlatConfigFileSpec
    active?: boolean | null
  }>(),
  { active: null },
)
</script>

<template>
  <div
    border="~ rounded" px2 font-mono
    :class="active === true ? 'border-amber:50 text-amber bg-amber:5' : active === false ? 'border-base bg-gray:5 text-gray op50' : 'border-base bg-gray:5 text-gray'"
  >
    {{ glob }}
  </div>
</template>
