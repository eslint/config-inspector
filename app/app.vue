<script setup lang="ts">
import { useRuntimeConfig } from '#app/nuxt'
import { NuxtPage } from '#components'
import ConfigInspectorBadge from '~/components/ConfigInspectorBadge.vue'
import NavBar from '~/components/NavBar.vue'
import { initDark } from '~/composables/dark'
import { errorInfo, init, isLoading } from '~/composables/payload'
import { initShiki } from '~/composables/shiki'

import 'floating-vue/dist/style.css'
import './styles/global.css'

const config = useRuntimeConfig()
initDark()
initShiki()
init(config.app.baseURL)
</script>

<template>
  <div v-if="errorInfo" grid h-full w-full place-content-center whitespace-pre-line p4>
    <ConfigInspectorBadge mb6 text-xl font-200 />

    <div text-2xl text-rose-700 font-bold dark:text-rose-300>
      Failed to load <span rounded bg-rose-50 px2 dark:bg-rose-900:20>eslint.config.js</span><br>
    </div>

    <div text-lg text-rose-700 font-mono dark:text-rose-300>
      {{ errorInfo.error }}
    </div>

    <div mt6 color-muted>
      Note that
      <a href="https://github.com/eslint/config-inspector" target="_blank" hover:underline>config inspector</a>
      only works with the <a href="https://eslint.org/docs/latest/use/configure/configuration-files-new" target="_blank" font-bold hover:underline>flat config format</a>.
    </div>
  </div>
  <div v-else-if="isLoading" flex="~ col" h-full w-full items-center justify-center p4>
    <div flex="~ gap-2 items-center" flex-auto animate-pulse text-xl>
      <div i-svg-spinners-90-ring-with-bg />
      Loading config...
    </div>
    <ConfigInspectorBadge mt6 text-xl font-200 :show-version="false" />
  </div>
  <div v-else px4 py6 lg:px14 lg:py10>
    <NavBar />
    <NuxtPage />
  </div>
</template>
