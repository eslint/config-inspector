import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/cli.ts',
  ],
  clean: false,
  inputOptions: {
    experimental: {
      resolveNewUrlToAsset: false,
    },
  },
})
