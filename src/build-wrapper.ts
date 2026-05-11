import type { ReadConfigOptions } from './configs'
import fs from 'node:fs/promises'
import process from 'node:process'
import { createBuild } from 'devframe/adapters/build'
import { relative, resolve } from 'pathe'
import { glob } from 'tinyglobby'
import { readConfig } from './configs'
import { MARK_CHECK, MARK_INFO } from './constants'
import devframe, { setBuildPayload } from './devframe'
import { ConfigInspectorError } from './errors'

export interface BuildOptions {
  config?: string
  files?: boolean
  basePath?: string
  base: string
  outDir: string
}

export async function runBuild(options: BuildOptions): Promise<void> {
  console.log(MARK_INFO, 'Building static ESLint config inspector...')

  const cwd = process.cwd()
  const outDir = resolve(cwd, options.outDir)

  const readOptions: ReadConfigOptions = {
    cwd,
    userConfigPath: options.config,
    userBasePath: options.basePath,
    globMatchedFiles: options.files ?? true,
  }

  let configs
  try {
    configs = await readConfig(readOptions)
  }
  catch (error) {
    if (error instanceof ConfigInspectorError) {
      error.prettyPrint()
      process.exit(1)
    }
    throw error
  }

  configs.payload.meta.basePath = ''
  configs.payload.meta.configPath = ''
  setBuildPayload(configs.payload)

  let baseURL = options.base
  if (!baseURL.endsWith('/'))
    baseURL += '/'
  if (!baseURL.startsWith('/'))
    baseURL = `/${baseURL}`
  baseURL = baseURL.replace(/\/+/g, '/')

  await createBuild(devframe, { outDir, base: baseURL })

  if (baseURL !== '/') {
    const htmlFiles = await glob('**/*.html', {
      cwd: outDir,
      onlyFiles: true,
      expandDirectories: false,
    })
    for (const file of htmlFiles) {
      const filepath = resolve(outDir, file)
      const content = await fs.readFile(filepath, 'utf-8')
      const newContent = content
        .replaceAll(/\s(href|src)="\//g, ` $1="${baseURL}`)
        .replaceAll('baseURL:"/"', `baseURL:"${baseURL}"`)
        .replaceAll('"#entry":"/_nuxt/', `"#entry":"${baseURL}_nuxt/`)
      await fs.writeFile(filepath, newContent, 'utf-8')
    }
  }

  console.log(MARK_CHECK, `Built to ${relative(cwd, outDir)}`)
  console.log(MARK_INFO, `You can use a static server like \`npx serve ${relative(cwd, outDir)}\` to serve the inspector`)
}
