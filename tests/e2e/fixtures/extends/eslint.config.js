import js from '@eslint/js'
import { defineConfig } from 'eslint/config'

export default defineConfig(js.configs.recommended, {
  files: ['root.js'],
  extends: [
    {
      files: ['subdir/*.js'],
      rules: { 'no-unused-vars': 'off' },
    },
  ],
})
