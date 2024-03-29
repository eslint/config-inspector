import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'bg-base': 'bg-white dark:bg-#111',
    'bg-glass': 'bg-white:75 dark:bg-#111:75 backdrop-blur-5',
    'bg-hover': 'bg-gray:5',
    'bg-active': 'bg-gray:10',
    'border-base': 'border-#aaa3',
    'border-box': 'border border-base rounded',
    'text-button': 'border-box bg-hover hover:bg-active px3 py1 flex gap-1 items-center justify-center',
    'icon-button': 'border-box bg-hover hover:bg-active p1',
    'icon-button-sm': 'icon-button p0.5 text-sm',
    'action-button': 'border border-base rounded flex gap-2 items-center px2 py1 text-sm op75 hover:op100 hover:bg-hover',
  },
  theme: {
    colors: {
      primary: '#4B32C3',
      accent: '#8080F2',
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
