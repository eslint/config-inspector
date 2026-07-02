import type { Preview } from '@storybook/vue3-vite'
import type { Payload } from '../shared/types'
import { setup } from '@storybook/vue3-vite'
import FloatingVue from 'floating-vue'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { demoPayload } from '../app/components/fixtures'
import { isDark } from '../app/composables/dark'
import { isFetching, setPayload } from '../app/composables/payload'
import { initShiki } from '../app/composables/shiki'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import 'floating-vue/dist/style.css'
import '../app/styles/global.css'
import './docs-dark.css'

// Components navigate through the router on interaction; a memory router with
// the app's route paths keeps them functional without booting Nuxt.
const RouteStub = { render: () => null }
const router = createRouter({
  history: createMemoryHistory(),
  routes: ['/', '/configs', '/rules', '/files'].map(path => ({ path, component: RouteStub })),
})

setup((app) => {
  app.use(FloatingVue, { overflowPadding: 20 })
  app.use(router)
})

// Keep the docs page root in sync with the theme global (decorators only
// cover story roots, not the surrounding docs page).
try {
  addons.getChannel().on(GLOBALS_UPDATED, ({ globals }: { globals?: { theme?: string } }) => {
    document.documentElement.classList.toggle('dark', globals?.theme === 'dark')
  })
}
catch {
  // No channel in portable stories (vitest); the decorator covers it there.
}

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Overview', '*'],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  loaders: [
    async () => {
      await initShiki()
    },
  ],
  decorators: [
    (story, ctx) => {
      // Drive `isDark` (instead of just the root class) so plugin colors and
      // other `isDark`-derived values follow the toolbar toggle.
      isDark.value = ctx.globals.theme === 'dark'
      // Seed the shared payload state; stories can pass their own via
      // `parameters.payload`.
      setPayload((ctx.parameters.payload as Payload | undefined) ?? demoPayload)
      isFetching.value = false
      return () => h('div', { class: 'p-8 bg-base color-base font-sans' }, [h(story())])
    },
  ],
}

export default preview
