<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { errorInfo } from './composables/payload'
import 'floating-vue/dist/style.css'
import './styles/global.css'
import './composables/dark'
import { version } from './package.json'
import { ensureDataFetch } from '~/composables/payload'

useHead({
  title: 'ESLint Config Inspector',
})

await ensureDataFetch()
</script>

<template>
  <div v-if="errorInfo" grid h-full w-full place-content-center whitespace-pre-line>
    <div font-200 text-xl mb6>
      <a
        href="https://github.com/eslint/config-inspector" target="_blank"
        flex="inline gap-2 items-center" mr1
      >
        <img src="/favicon.svg" inline-block h-1em>
        <span op75>ESLint Config Inspector</span>
      </a>
      <sup op50>v{{ version }}</sup>
    </div>

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
  <div v-else px14 py10>
    <NavBar />
    <NuxtPage />
  </div>
</template>
