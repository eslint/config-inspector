import { presetAnthonyDesign } from '@antfu/design/unocss'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      // Setting `include` replaces the default scan pipeline, so restate the
      // defaults (the CSS matcher keeps `--at-apply` directives expanding in
      // the app's and `@antfu/design`'s stylesheets), then add the co-located
      // `*.stories.ts` files (they reference icon and utility literals).
      include: [
        /\.(?:css|postcss|sass|scss|less|stylus|styl)($|\?)/,
        /\.(?:vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|html)($|\?)/,
        /\.stories\.[jt]s($|\?)/,
      ],
    },
  },
  presets: [
    presetAnthonyDesign({
      // ESLint brand tokens, kept from the previous local theme.
      // Reference: https://github.com/eslint/eslint.org/blob/main/src/assets/scss/tokens/themes.scss
      primary: {
        25: '#FBFBFF',
        50: '#F6F6FE',
        100: '#ECECFD',
        200: '#DEDEFF',
        300: '#CCCCFA',
        400: '#B7B7FF',
        500: '#A0A0F5',
        600: '#8080F2',
        700: '#6358D4',
        800: '#4B32C3',
        900: '#341BAB',
        DEFAULT: '#8080F2',
      },
      darkBackground: '#101828',
      fonts: {
        sans: 'Inter',
        mono: 'Space Mono',
      },
      overrides: {
        // The ESLint primary ramp is lighter than the preset default: step 600
        // (#8080F2) fails WCAG AA contrast on light surfaces, so active states
        // read from the darker/lighter ends of the ramp instead.
        'color-active': 'color-primary-700 dark:color-primary-400',
        'border-active': 'border-primary-700/30 dark:border-primary-400/25',
      },
      theme: {
        colors: {
          neutral: {
            25: '#FCFCFD',
            50: '#F9FAFB',
            100: '#F2F4F7',
            200: '#E4E7EC',
            300: '#D0D5DD',
            400: '#98A2B3',
            500: '#667085',
            600: '#475467',
            700: '#344054',
            800: '#1D2939',
            900: '#101828',
          },
        },
      },
    }),
    presetWind4(),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Space Mono',
      },
      processors: createLocalFontProcessor({
        fontAssetsDir: './public/fonts',
        fontServeBaseUrl: '/fonts',
      }),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  shortcuts: {
    // Named z-index layers — the preset blocks plain `z-<n>` so every
    // z-index goes through a named layer the app owns.
    'z-nav': 'z-[30]',
    'z-dropdown': 'z-[40]',
    'z-tooltip': 'z-[45]',
    'z-toast': 'z-[50]',
    'z-modal-backdrop': 'z-[60]',
    'z-modal-content': 'z-[70]',
  },
})
