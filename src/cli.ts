import process from 'node:process'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import open from 'open'
import { getPort } from 'get-port-please'
import cac from 'cac'
import c from 'picocolors'
import fg from 'fast-glob'
import { createHostServer } from './server'
import { distDir } from './dirs'
import { readConfig } from './configs'
import { MARK_CHECK, MARK_INFO } from './constants'

const cli = cac(
  'eslint-config-inspector',
)

cli
  .command('build', 'Build inspector with current config file for static hosting')
  .option('--config <configFile>', 'Config file path')
  .option('--files', 'Include matched file paths in payload', { default: true })
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  // Build specific options
  .option('--base <baseURL>', 'Base URL for deployment', { default: '/' })
  .option('--outDir <dir>', 'Output directory', { default: '.eslint-config-inspector' })
  // Action
  .action(async (options) => {
    console.log(MARK_INFO, 'Building static ESLint config inspector...')

    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    const cwd = process.cwd()
    const outDir = resolve(cwd, options.outDir)
    const configs = await readConfig({
      cwd,
      userConfigPath: options.config,
      userBasePath: options.basePath,
      globMatchedFiles: options.files,
    })

    let baseURL = options.base
    if (!baseURL.endsWith('/'))
      baseURL += '/'
    if (!baseURL.startsWith('/'))
      baseURL = `/${baseURL}`
    baseURL = baseURL.replace(/\/+/g, '/')

    if (existsSync(outDir))
      await fs.rm(outDir, { recursive: true })
    await fs.mkdir(outDir, { recursive: true })
    await fs.cp(distDir, outDir, { recursive: true })
    const htmlFiles = await fg('**/*.html', { cwd: distDir, onlyFiles: true })
    // Rewrite HTML files with base URL
    if (baseURL !== '/') {
      for (const file of htmlFiles) {
        const content = await fs.readFile(resolve(distDir, file), 'utf-8')
        const newContent = content
          .replaceAll(/\s(href|src)="\//g, ` $1="${baseURL}`)
          .replaceAll('baseURL:"/"', `baseURL:"${baseURL}"`)
        await fs.writeFile(resolve(outDir, file), newContent, 'utf-8')
      }
    }
    await fs.mkdir(resolve(outDir, 'api'), { recursive: true })

    configs.payload.meta.configPath = ''
    configs.payload.meta.basePath = ''
    await fs.writeFile(resolve(outDir, 'api/payload.json'), JSON.stringify(configs.payload, null, 2), 'utf-8')

    console.log(MARK_CHECK, `Built to ${relative(cwd, outDir)}`)
    console.log(MARK_INFO, `You can use static server like \`npx serve ${relative(cwd, outDir)}\` to serve the inspector`)
  })

cli
  .command('', 'Start dev inspector')
  .option('--config <configFile>', 'Config file path')
  .option('--files', 'Include matched file paths in payload', { default: true })
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  // Dev specific options
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: process.env.PORT || 7777 })
  .option('--open', 'Open browser', { default: true })
  // Action
  .action(async (options) => {
    const host = options.host
    const port = await getPort({ port: options.port, portRange: [7777, 9000], host })

    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    console.log(MARK_INFO, `Starting ESLint config inspector at`, c.green(`http://${host}:${port}`), '\n')

    const cwd = process.cwd()
    const server = await createHostServer({
      cwd,
      userConfigPath: options.config,
      userBasePath: options.basePath,
      globMatchedFiles: options.files,
    })

    server.listen(port, host, async () => {
      if (options.open)
        await open(`http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`)
    })
  })

cli.help()
cli.parse()
