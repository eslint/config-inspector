import type { StorybookConfig } from '@storybook/vue3-vite'
import type { Plugin } from 'vite'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { mergeConfig } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Templates reference public assets by absolute URL (e.g. `/favicon.svg`),
 * which plugin-vue compiles into module imports. Resolve those to plain URL
 * strings so the files are fetched from the static dir at runtime instead.
 */
function publicAssetUrls(): Plugin {
  return {
    name: 'storybook:public-asset-urls',
    enforce: 'pre',
    resolveId(id) {
      const path = id.split('?')[0]!
      if (path.startsWith('/') && !path.startsWith('/@') && existsSync(join(root, 'public', path)))
        return `\0public-asset${path}`
      return undefined
    },
    load(id) {
      if (id.startsWith('\0public-asset'))
        return `export default ${JSON.stringify(id.slice('\0public-asset'.length))}`
      return undefined
    },
  }
}

const config: StorybookConfig = {
  // MDX before stories so the Overview page can resolve component stories.
  stories: [
    '../app/components/**/*.mdx',
    '../app/components/**/*.stories.@(ts|js)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: false,
    },
  },
  staticDirs: ['../public'],
  viteFinal: base => mergeConfig(base, {
    plugins: [
      Vue(),
      Unocss({ configFile: resolve(root, 'uno.config.ts') }),
      publicAssetUrls(),
    ],
    resolve: {
      // Standalone replacements for the Nuxt-provided aliases and modules, so
      // components can be mounted without booting Nuxt.
      alias: {
        '~~': root,
        '~': resolve(root, 'app'),
        '#app/composables/router': 'vue-router',
        '#components': resolve(root, '.storybook/nuxt-stubs.ts'),
      },
    },
  }),
}

export default config
