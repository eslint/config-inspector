import { devframePlugin } from './src/devframe-vite-plugin'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/eslint',
    'nuxt-eslint-auto-explicit-import',
  ],

  eslint: {
    config: {
      standalone: false,
    },
  },

  experimental: {
    typedPages: true,
    clientNodeCompat: true,
  },

  features: {
    inlineStyles: false,
  },

  css: [
    '@unocss/reset/tailwind.css',
  ],

  nitro: {
    preset: 'static',
    output: {
      dir: './dist',
    },
    routeRules: {
      '/': {
        prerender: true,
      },
      '/200.html': {
        prerender: true,
      },
      '/404.html': {
        prerender: true,
      },
      '/*': {
        prerender: false,
      },
    },
    sourceMap: false,
  },

  app: {
    baseURL: './',
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `/favicon.svg` },
      ],
      title: 'ESLint Config Inspector',
    },
  },

  vite: {
    base: './',
    plugins: [devframePlugin()],
    optimizeDeps: {
      // @keep-sorted
      // @keep-unique
      include: [
        '@eslint/config-array',
        '@shikijs/engine-javascript',
        '@shikijs/langs-precompiled/javascript',
        '@shikijs/langs-precompiled/typescript',
        '@shikijs/themes/vitesse-dark',
        '@shikijs/themes/vitesse-light',
        '@shikijs/transformers',
        'devframe',
        'devframe/client',
        'floating-vue',
        'fuse.js',
        'minimatch',
        'shiki/core',
      ],
    },
  },

  devtools: {
    enabled: false,
  },

  compatibilityDate: '2024-07-17',
})
