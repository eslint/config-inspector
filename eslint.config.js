// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default nuxt()
  .prepend(
    antfu(
      {
        unocss: true,
        vue: {
          overrides: {
            'vue/no-extra-parens': 'off',
          },
        },
      },
    ),
  )
  .append({
    files: ['src/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  })
