<script setup lang="ts">
import type { Linter } from 'eslint'

defineProps<{
  glob: Linter.FlatConfigFileSpec | Linter.FlatConfigFileSpec[]
}>()
</script>

<template>
  <div border="~ base rounded" bg-gray:5 px2 font-mono op75>
    {{ glob }}
  </div>
</template>
