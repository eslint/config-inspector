<script setup lang="ts">
import { useRouter } from '#app/composables/router'

const router = useRouter()
router.replace('/configs')
</script>

<template>
  <div>
    <slot />
  </div>
</template>
