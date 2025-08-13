import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'color-base': 'color-neutral-800 dark:color-neutral-300',
    'bg-base': 'bg-white dark:bg-neutral-900',
    'border-base': 'border-#aaa3',

    'bg-tooltip': 'bg-white:75 dark:bg-neutral-900:75 backdrop-blur-8',
    'bg-glass': 'bg-white:75 dark:bg-neutral-900:75 backdrop-blur-5',
    'bg-code': 'bg-gray5:5',
    'bg-hover': 'bg-primary-400:5',

    'color-active': 'color-primary-600 dark:color-primary-400',
    'border-active': 'border-primary-600/25 dark:border-primary-400/25',
    'bg-active': 'bg-primary-400:10',

    'btn-action': 'border border-base rounded flex gap-2 items-center px2 py1 op75 hover:op100 hover:bg-hover',
    'btn-action-sm': 'btn-action text-sm',
    'btn-action-active': 'color-active border-active! bg-active op100!',

    'badge': 'border border-base rounded flex items-center px2',
    'badge-active': 'badge border-amber:50 text-amber bg-amber:5',
    'btn-badge': 'badge hover:bg-active',
  },
  theme: {
    // Reference: https://github.com/eslint/eslint.org/blob/main/src/assets/scss/tokens/themes.scss
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

      primary: {
        DEFAULT: '#8080F2',
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
      },

      warning: {
        25: '#FFFCF5',
        50: '#FFFAEB',
        100: '#FEF0C7',
        200: '#FEDF89',
        300: '#FEC84B',
        400: '#FDB022',
        500: '#F79009',
        600: '#DC6803',
        700: '#B54708',
        800: '#93370D',
        900: '#7A2E0E',
      },

      success: {
        25: '#F6FEF9',
        50: '#ECFDF3',
        100: '#D1FADF',
        200: '#A6F4C5',
        300: '#6CE9A6',
        400: '#32D583',
        500: '#12B76A',
        600: '#039855',
        700: '#027A48',
        800: '#05603A',
        900: '#054F31',
      },

      rose: {
        25: '#FFF5F6',
        50: '#FFF1F3',
        100: '#FFE4E8',
        200: '#FECDD6',
        300: '#FEA3B4',
        400: '#FD6F8E',
        500: '#F63D68',
        600: '#E31B54',
        700: '#C01048',
        800: '#A11043',
        900: '#89123E',
      },
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Space Mono',
      },
      processors: createLocalFontProcessor({
        fontAssetsDir: './public/fonts',
        fontServeBaseUrl: './fonts',
      }),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
