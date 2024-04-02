#!/usr/bin/env node
/* eslint-disable no-console */
import process from 'node:process'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import open from 'open'
import { getPort } from 'get-port-please'
import cac from 'cac'

const cli = cac()

cli
  .command('build', 'Build inspector with current config file for static hosting')
  .option('--config <configFile>', 'Config file path', { default: process.env.ESLINT_CONFIG })
  .option('--out-dir <dir>', 'Output directory', { default: '.eslint-config-inspector' })
  .action(async (options) => {
    console.log('Building static ESLint config inspector...')

    const cwd = process.cwd()
    const outDir = resolve(cwd, options.outDir)
    const { readConfig } = await import('./dist/server/chunks/routes/api/utils.mjs')
    const configs = await readConfig(cwd, options.config || process.env.ESLINT_CONFIG)
    if (existsSync(outDir))
      await fs.rm(outDir, { recursive: true })
    await fs.mkdir(outDir, { recursive: true })
    const distDir = new URL('./dist/public', import.meta.url)
    await fs.cp(distDir, outDir, { recursive: true })
    await fs.mkdir(resolve(outDir, 'api'), { recursive: true })
    configs.payload.meta.configPath = ''
    await fs.writeFile(resolve(outDir, 'api/payload.json'), JSON.stringify(configs.payload, null, 2), 'utf-8')

    console.log(`Built to ${relative(cwd, outDir)}`)
    console.log(`You can use static server like \`npx serve ${relative(cwd, outDir)}\` to serve the inspector`)
  })

cli
  .command('', 'Start dev inspector')
  .option('--config <configFile>', 'Config file path', { default: process.env.ESLINT_CONFIG })
  .option('--host <host>', 'Host', { default: process.env.HOST || '127.0.0.1' })
  .option('--port <port>', 'Port', { default: process.env.PORT || 7777 })
  .option('--open', 'Open browser', { default: true })
  .action(async (options) => {
    process.env.HOST = options.host
    process.env.PORT = await getPort({ port: options.port })
    if (options.config)
      process.env.ESLINT_CONFIG = options.config

    process.argv = process.argv.slice(0, 2)

    await Promise.all([
      import('./dist/server/index.mjs'),
      options.open ? open(`http://localhost:${process.env.PORT}`) : undefined,
    ])
  })

cli.help()
cli.parse()
