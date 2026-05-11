import process from 'node:process'
import { defineConfig } from '@playwright/test'

const FIXTURE = 'tests/e2e/fixtures/basic'
const EXTENDS_FIXTURE = 'tests/e2e/fixtures/extends'
const DEV_PORT = 17780
const EXTENDS_DEV_PORT = 17781
const BUILD_PORT = 17790
const BUILD_OUT = 'tests/e2e/.output/build'

export const EXTENDS_BASE_URL = `http://127.0.0.1:${EXTENDS_DEV_PORT}`

/**
 * Build-mode tests are opt-in via `E2E_INCLUDE_BUILD=1`. `devframe@0.1.22`'s
 * static build adapter ships its bundled hash module with `ohash`'s Node
 * entry, and unenv (Nuxt's client node-compat layer) does not implement
 * `createHash`, so the built SPA crashes at runtime with
 * "crypto.createHash is not implemented yet!" before the payload loads.
 * Drop this gate once the upstream issue resolves.
 */
const INCLUDE_BUILD = !!process.env.E2E_INCLUDE_BUILD

export default defineConfig({
  testDir: 'tests/e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'dev',
      use: { baseURL: `http://127.0.0.1:${DEV_PORT}` },
    },
    ...(INCLUDE_BUILD
      ? [{
          name: 'build',
          use: { baseURL: `http://127.0.0.1:${BUILD_PORT}` },
        }]
      : []),
  ],
  webServer: [
    {
      command: `node bin.mjs --config ${FIXTURE}/eslint.config.js --basePath ${FIXTURE} --no-open --port ${DEV_PORT}`,
      url: `http://127.0.0.1:${DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: `node bin.mjs --config ${EXTENDS_FIXTURE}/eslint.config.js --basePath ${EXTENDS_FIXTURE} --no-open --port ${EXTENDS_DEV_PORT}`,
      url: `http://127.0.0.1:${EXTENDS_DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    ...(INCLUDE_BUILD
      ? [{
          command: `node bin.mjs build --config ${FIXTURE}/eslint.config.js --basePath ${FIXTURE} --outDir ${BUILD_OUT} --base / && npx serve ${BUILD_OUT} --single --listen ${BUILD_PORT} --no-clipboard`,
          url: `http://127.0.0.1:${BUILD_PORT}`,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          stdout: 'pipe' as const,
          stderr: 'pipe' as const,
        }]
      : []),
  ],
})
