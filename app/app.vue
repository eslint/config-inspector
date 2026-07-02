<script setup lang="ts">
import FeedbackSpinner from '@antfu/design/components/Feedback/FeedbackSpinner.vue'
import FeedbackTip from '@antfu/design/components/Feedback/FeedbackTip.vue'
import { provideColorScheme } from '@antfu/design/composables/colorScheme'
import { useRuntimeConfig } from '#app/nuxt'
import { NuxtPage } from '#components'
import ConfigInspectorBadge from '~/components/ConfigInspectorBadge.vue'
import NavBar from '~/components/NavBar.vue'
import { initDark, isDark } from '~/composables/dark'
import { errorInfo, init, isLoading } from '~/composables/payload'
import { initShiki } from '~/composables/shiki'

import 'floating-vue/dist/style.css'
import '@antfu/design/styles/base.css'
import '@antfu/design/styles/scrollbar.css'
import '@antfu/design/styles/animations.css'
import '@antfu/design/styles/reka-ui.css'
import '@antfu/design/styles/floating-vue.css'
import './styles/global.css'

const config = useRuntimeConfig()
initDark()
provideColorScheme(() => isDark.value ? 'dark' : 'light')
initShiki()
init(config.app.baseURL)
</script>

<template>
  <div v-if="errorInfo" class="p4 gap-3 grid h-full w-full whitespace-pre-line place-content-center">
    <ConfigInspectorBadge class="text-xl font-200 mb3" />

    <div class="text-2xl color-scale-critical font-bold">
      Failed to load <span class="px2 rounded bg-red-500/10">eslint.config.js</span>
    </div>

    <FeedbackTip type="error" icon="i-ph-warning-circle-duotone">
      <div class="font-mono">
        {{ errorInfo.error }}
      </div>
    </FeedbackTip>

    <div class="color-muted mt3">
      Note that
      <a href="https://github.com/eslint/config-inspector" target="_blank" class="hover:underline">config inspector</a>
      only works with the <a href="https://eslint.org/docs/latest/use/configure/configuration-files-new" target="_blank" class="font-bold hover:underline">flat config format</a>.
    </div>
  </div>
  <div v-else-if="isLoading" class="p4 flex flex-col h-full w-full items-center justify-center">
    <div class="text-xl flex flex-auto gap-2 items-center animate-pulse">
      <FeedbackSpinner />
      Loading config...
    </div>
    <ConfigInspectorBadge class="text-xl font-200 mt6" :show-version="false" />
  </div>
  <div v-else class="px4 py6 lg:px14 lg:py10">
    <NavBar />
    <NuxtPage />
  </div>
</template>
