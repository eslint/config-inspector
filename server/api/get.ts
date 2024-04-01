import process from 'node:process'
import fs from 'node:fs'
import { bundleRequire } from 'bundle-require'
import { relative, resolve } from 'pathe'
import type { Linter } from 'eslint'
import chokidar from 'chokidar'
import { consola } from 'consola'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { getPort } from 'get-port-please'
import fg from 'fast-glob'
import type { Payload, RuleInfo } from '~/composables/types'

const configs = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

const readErrorWarning = `Failed to load \`eslint.config.js\`.
Note that \`@eslint/config-inspector\` only works with the flat config format:
https://eslint.org/docs/latest/use/configure/configuration-files-new`

export default lazyEventHandler(async () => {
  const wsPort = await getPort({ port: 7811, random: true })
  const wss = new WebSocketServer({
    port: wsPort,
  })
  const wsClients = new Set<WebSocket>()
  wss.on('connection', (ws) => {
    wsClients.add(ws)
    consola.log('Websocket client connected')
    ws.on('close', () => wsClients.delete(ws))
  })

  const cwd = process.cwd()
  const configPath = resolve(cwd, process.env.ESLINT_CONFIG || configs.find(i => fs.existsSync(resolve(cwd, i))) || configs[0])

  const eslintRules = await import(['eslint', 'use-at-your-own-risk'].join('/')).then(r => r.default.builtinRules)

  let invalidated = true
  let rawConfigs: Linter.FlatConfig[] = []
  let payload: Payload = undefined!

  const watcher = chokidar.watch([], {
    ignoreInitial: true,
    cwd: process.cwd(),
    disableGlobbing: true,
  })

  watcher.on('change', (path) => {
    invalidated = true
    consola.info('Config change detected', path)
    wsClients.forEach((ws) => {
      ws.send(JSON.stringify({
        type: 'config-change',
        path,
      }))
    })
  })

  async function readConfig() {
    const { mod, dependencies } = await bundleRequire({
      filepath: configPath,
    })
    rawConfigs = await (mod.default ?? mod) as Linter.FlatConfig[]
    payload = await processConfig(rawConfigs)
    watcher.add(dependencies)
    invalidated = false

    consola.success(`Read ESLint config from \`${relative(cwd, configPath)}\` with`, rawConfigs.length, 'configs and', Object.keys(payload.rules).length, 'rules')
  }

  async function processConfig(raw: Linter.FlatConfig[]): Promise<Payload> {
    const rulesMap = new Map<string, RuleInfo>()

    for (const [name, rule] of eslintRules.entries()) {
      rulesMap.set(name, {
        ...(rule as any).meta as any,
        name,
        plugin: 'eslint',
        schema: undefined,
        messages: undefined,
      })
    }

    for (const item of raw) {
      for (const [prefix, plugin] of Object.entries(item.plugins ?? {})) {
        for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
          rulesMap.set(`${prefix}/${name}`, {
            ...(rule as any).meta as any,
            name: `${prefix}/${name}`,
            plugin: prefix,
            schema: undefined,
            messages: undefined,
          })
        }
      }
    }

    const rules = Object.fromEntries(rulesMap.entries())
    const configs = raw.map((c): Linter.FlatConfig => {
      return {
        ...c,
        plugins: c.plugins
          ? Object.fromEntries(Object.entries(c.plugins ?? {}).map(([prefix]) => [prefix, {}]))
          : undefined,
        languageOptions: c.languageOptions
          ? { ...c.languageOptions, parser: c.languageOptions.parser?.meta?.name as any }
          : undefined,
        processor: (c.processor as any)?.meta?.name,
      }
    })

    const files = await fg(
      configs.flatMap(i => i.files ?? []).filter(i => typeof i === 'string') as string[],
      {
        cwd,
        onlyFiles: true,
        ignore: [
          '**/node_modules/**',
          ...configs.flatMap(i => i.ignores ?? []).filter(i => typeof i === 'string') as string[],
        ],
        deep: 5,
      },
    )

    return {
      configs,
      rules,
      files,
      cwd,
      meta: {
        lastUpdate: Date.now(),
        wsPort,
        configPath,
      },
    }
  }

  return defineEventHandler(async () => {
    try {
      if (invalidated)
        await readConfig()
      return payload
    }
    catch (e) {
      consola.error(readErrorWarning)
      consola.error(e)
      return {
        message: readErrorWarning,
        error: String(e),
      }
    }
  })
})
