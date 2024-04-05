import process from 'node:process'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import open from 'open'
import { getPort } from 'get-port-please'
import cac from 'cac'
import { createHostServer } from './server'
import { distDir } from './dirs'
import { readConfig } from './configs'

const cli = cac()

cli
  .command('build', 'Build inspector with current config file for static hosting')
  .option('--config <configFile>', 'Config file path')
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  .option('--out-dir <dir>', 'Output directory', { default: '.eslint-config-inspector' })
  .action(async (options) => {
    console.log('Building static ESLint config inspector...')

    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    const cwd = process.cwd()
    const outDir = resolve(cwd, options.outDir)
    const configs = await readConfig({
      cwd,
      userConfigPath: options.config,
      userBasePath: options.basePath,
    })

    if (existsSync(outDir))
      await fs.rm(outDir, { recursive: true })
    await fs.mkdir(outDir, { recursive: true })
    await fs.cp(distDir, outDir, { recursive: true })
    await fs.mkdir(resolve(outDir, 'api'), { recursive: true })

    configs.payload.meta.configPath = ''
    configs.payload.meta.rootPath = ''
    await fs.writeFile(resolve(outDir, 'api/payload.json'), JSON.stringify(configs.payload, null, 2), 'utf-8')

    console.log(`Built to ${relative(cwd, outDir)}`)
    console.log(`You can use static server like \`npx serve ${relative(cwd, outDir)}\` to serve the inspector`)
  })

cli
  .command('', 'Start dev inspector')
  .option('--config <configFile>', 'Config file path')
  .option('--basePath <basePath>', 'Base directory for globs to resolve. Default to directory of config file if not provided')
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: process.env.PORT || 7777 })
  .option('--open', 'Open browser', { default: true })
  .action(async (options) => {
    const host = options.host
    const port = await getPort({ port: options.port })

    if (process.env.ESLINT_CONFIG)
      options.config ||= process.env.ESLINT_CONFIG

    console.log(`Starting ESLint config inspector at http://${host}:${port}`)

    const cwd = process.cwd()
    const server = await createHostServer({
      cwd,
      userConfigPath: options.config,
      userBasePath: options.basePath,
    })

    server.listen(port, host)

    if (options.open)
      await open(`http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`)
  })

cli.help()
cli.parse()
