export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/eslint',
    'nuxt-shiki',
    'nuxt-eslint-auto-explicit-import',
  ],

  srcDir: 'app',

  eslint: {
    config: {
      standalone: false,
    },
  },

  experimental: {
    typedPages: true,
  },

  features: {
    inlineStyles: false,
  },

  shiki: {
    bundledLangs: ['js', 'ts'],
    bundledThemes: ['vitesse-light', 'vitesse-dark'],
    highlightOptions: {
      themes: {
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
    },
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
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  vite: {
    vue: {
      script: {
        defineModel: true,
      },
    },
  },

  devtools: {
    enabled: false,
  },
})
