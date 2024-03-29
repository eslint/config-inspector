import pkg from './package.json'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxt/eslint',
    'nuxt-shiki',
    'nuxt-eslint-auto-explicit-import',
  ],

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
    preset: 'node-server',
    output: {
      dir: './dist',
    },
    routeRules: {
      '/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Expose-Headers': '*',
        },
      },
    },
    prerender: {
      routes: ['/'],
    },
    sourceMap: false,
    externals: {
      trace: false,
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies),
      ],
    },
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
