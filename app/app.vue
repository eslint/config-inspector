<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useRuntimeConfig } from '#app/nuxt'
import { errorInfo, init, isLoading } from '~/composables/payload'

import 'floating-vue/dist/style.css'
import './styles/global.css'
import './composables/dark'

const config = useRuntimeConfig()
init(config.app.baseURL)

useHead({
  title: 'ESLint Config Inspector',
})
</script>

<template>
  <div v-if="errorInfo" grid h-full w-full place-content-center whitespace-pre-line p4>
    <ConfigInspectorBadge font-200 text-xl mb6 />

    <div text-2xl text-red5 font-bold>
      Failed to load <span rounded bg-red:5 px2>eslint.config.js</span><br>
    </div>

    <div text-lg text-red font-mono>
      {{ errorInfo.error }}
    </div>

    <div op50 mt6>
      Note that
      <a href="https://github.com/eslint/config-inspector" target="_blank" hover:underline>config inspector</a>
      only works with the <a href="https://eslint.org/docs/latest/use/configure/configuration-files-new" target="_blank" font-bold hover:underline>flat config format</a>.
    </div>
  </div>
  <div v-else-if="isLoading" p4 flex="~ col" w-full h-full items-center justify-center>
    <div animate-pulse flex="~ gap-2 items-center" text-xl flex-auto>
      <div i-svg-spinners-90-ring-with-bg />
      Loading config...
    </div>
    <ConfigInspectorBadge font-200 text-xl mt6 :show-version="false" />
  </div>
  <div v-else px4 py6 lg:px14 lg:py10>
    <NavBar />
    <NuxtPage />
  </div>
</template>
