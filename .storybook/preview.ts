import type { Preview } from '@storybook/vue3-vite'
import type { Payload } from '../shared/types'
import { provideColorScheme } from '@antfu/design/composables/colorScheme'
import { setup } from '@storybook/vue3-vite'
import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { demoPayload } from '../app/components/fixtures'
import { isDark } from '../app/composables/dark'
import { isFetching, setPayload } from '../app/composables/payload'
import { initShiki } from '../app/composables/shiki'

import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import 'floating-vue/dist/style.css'
import '@antfu/design/styles/base.css'
import '@antfu/design/styles/scrollbar.css'
import '@antfu/design/styles/animations.css'
import '@antfu/design/styles/reka-ui.css'
import '@antfu/design/styles/floating-vue.css'
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

// Mirrors the app root: provides the color scheme context that scheme-aware
// design components (badges, labels) fall back to.
const SchemeProvider = defineComponent({
  setup(_, { slots }) {
    provideColorScheme(() => isDark.value ? 'dark' : 'light')
    return () => h('div', { class: 'p-8 bg-base color-base font-sans' }, slots.default?.())
  },
})

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
    },
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
      return () => h(SchemeProvider, () => [h(story())])
    },
  ],
}

export default preview
