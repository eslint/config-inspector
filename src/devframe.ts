import type { ReadConfigOptions } from './configs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineDevframe } from 'devframe'
import { version } from '../package.json' with { type: 'json' }
import { resolveConfigPath } from './configs'
import { ConfigInspectorError } from './errors'
import { registerGetPayload } from './rpc/get-payload'
import { registerRunStats } from './rpc/run-stats'

const distDir = fileURLToPath(new URL('../dist/public', import.meta.url))

export interface DevtoolFlags {
  config?: string
  files?: boolean
  basePath?: string
}

const devframe = defineDevframe({
  id: 'eslint-config-inspector',
  name: 'ESLint Config Inspector',
  version,
  packageName: '@eslint/config-inspector',
  homepage: 'https://github.com/eslint/config-inspector#readme',
  description: 'A visual tool for inspecting and understanding your ESLint flat configs',
  icon: 'logos:eslint',
  cli: {
    command: 'eslint-config-inspector',
    distDir,
    port: 7777,
    portRange: [7777, 9000],
    host: '127.0.0.1',
    auth: false,
  },
  async setup(baseCtx, info) {
    const ctx = baseCtx.scope('eslint-config-inspector')
    const flags = (info?.flags ?? {}) as DevtoolFlags

    const readOptions: ReadConfigOptions = {
      cwd: process.cwd(),
      userConfigPath: flags.config || process.env.ESLINT_CONFIG,
      userBasePath: flags.basePath,
      globMatchedFiles: flags.files ?? true,
    }

    if (ctx.mode === 'dev') {
      try {
        await resolveConfigPath(readOptions)
      }
      catch (e) {
        if (e instanceof ConfigInspectorError) {
          e.prettyPrint()
          process.exit(1)
        }
        throw e
      }
    }

    registerGetPayload(ctx, readOptions)
    registerRunStats(ctx, readOptions)
  },
})

export default devframe
