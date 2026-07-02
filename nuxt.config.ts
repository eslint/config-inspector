import { devframePlugin } from './src/devframe-vite-plugin'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/eslint',
  ],

  imports: {
    autoImport: false,
  },

  components: {
    dirs: [],
  },

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
      // `@antfu/design` ships raw `.ts`/`.vue` source — let plugin-vue compile
      // it instead of esbuild dep pre-bundling.
      exclude: ['@antfu/design'],
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
        'colorjs.io',
        'devframe',
        'devframe/client',
        'floating-vue',
        'fuse.js',
        'minimatch',
        'reka-ui',
        'shiki/core',
      ],
    },
  },

  devtools: {
    enabled: false,
  },

  compatibilityDate: '2024-07-17',
})
