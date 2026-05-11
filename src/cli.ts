import process from 'node:process'
import c from 'ansis'
import cac from 'cac'
import { createDevServer, resolveDevServerPort } from 'devframe/adapters/dev'
import { runBuild } from './build-wrapper'
import { MARK_INFO } from './constants'
import devtool from './devtool'

const cli = cac('eslint-config-inspector')

cli
  .command('build', 'Build inspector with current config file for static hosting')
  .option('--config <configFile>', 'Config file path')
  .option('--files', 'Include matched file paths in payload', { default: true })
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  .option('--base <baseURL>', 'Base URL for deployment', { default: '/' })
  .option('--outDir <dir>', 'Output directory', { default: '.eslint-config-inspector' })
  .action(async (options) => {
    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    await runBuild({
      config: options.config,
      files: options.files,
      basePath: options.basePath,
      base: options.base,
      outDir: options.outDir,
    })
  })

cli
  .command('mcp', 'Start an MCP server exposing the inspector to coding agents (stdio) [experimental]')
  .action(async () => {
    const { createMcpServer } = await import('devframe/adapters/mcp')
    await createMcpServer(devtool, {
      transport: 'stdio',
      onReady: ({ transport }) => {
        console.error(`[eslint-config-inspector] MCP server ready (${transport})`)
      },
    })
  })

cli
  .command('', 'Start dev inspector')
  .option('--config <configFile>', 'Config file path')
  .option('--files', 'Include matched file paths in payload', { default: true })
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: Number(process.env.PORT) || 7777 })
  .option('--open', 'Open browser', { default: true })
  .option('--no-open', 'Do not open browser')
  .action(async (options) => {
    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    const flags = {
      config: options.config,
      files: options.files,
      basePath: options.basePath,
    }

    const host = options.host
    const port = await resolveDevServerPort(devtool, {
      host,
      defaultPort: Number(options.port),
    })

    await createDevServer(devtool, {
      host,
      port,
      flags,
      openBrowser: options.open,
      onReady: ({ origin }) => {
        console.log(MARK_INFO, 'ESLint config inspector at', c.green(origin), '\n')
      },
    })
  })

cli.help()
cli.parse()
