/* eslint-disable no-console */
import type { ErrorInfo, FilesGroup, FlatConfigItem, Payload, ResolvedPayload, RuleConfigStates, RuleInfo } from '~~/shared/types'
import { isGeneralConfig, isIgnoreOnlyConfig } from '~~/shared/configs'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'
import { $fetch } from 'ofetch'

const LOG_NAME = '[ESLint Config Inspector]'

const data = ref<Payload>({
  rules: {},
  configs: [],
  meta: {} as any,
})

/**
 * State of initial loading
 */
export const isLoading = ref(true)
/**
 * State of fetching, used for loading indicator
 */
export const isFetching = ref(false)
/**
 * Error information
 */
export const errorInfo = ref<ErrorInfo>()

function isErrorInfo(payload: Payload | ErrorInfo): payload is ErrorInfo {
  return 'error' in payload
}

async function get(baseURL: string) {
  isFetching.value = true
  const payload = await $fetch<Payload | ErrorInfo>('/api/payload.json', { baseURL })
  if (isErrorInfo(payload)) {
    errorInfo.value = payload
    isLoading.value = false
    isFetching.value = false
    return
  }
  errorInfo.value = undefined
  data.value = payload
  isLoading.value = false
  isFetching.value = false
  console.log(LOG_NAME, 'Config payload', payload)
  return payload
}

let _promise: Promise<Payload | undefined> | undefined

export function init(baseURL: string) {
  if (_promise)
    return
  _promise = get(baseURL)
    .then((payload) => {
      if (!payload)
        return

      if (typeof payload.meta.wsPort === 'number') {
      // Connect to WebSocket, listen for config changes
        const ws = new WebSocket(`ws://${location.hostname}:${payload.meta.wsPort}`)
        ws.addEventListener('message', async (event) => {
          console.log(LOG_NAME, 'WebSocket message', event.data)
          const payload = JSON.parse(event.data)
          if (payload.type === 'config-change')
            get(baseURL)
        })
        ws.addEventListener('open', () => {
          console.log(LOG_NAME, 'WebSocket connected')
        })
        ws.addEventListener('close', () => {
          console.log(LOG_NAME, 'WebSocket closed')
        })
        ws.addEventListener('error', (error) => {
          console.error(LOG_NAME, 'WebSocket error', error)
        })
      }

      return payload
    })
}

export function ensureDataFetch() {
  return _promise
}

export const payload = computed(() => Object.freeze(resolvePayload(data.value!)))

export function getRuleFromName(name: string): RuleInfo | undefined {
  return payload.value.rules[name]
}

export function getRuleStates(name: string): RuleConfigStates | undefined {
  return payload.value.ruleToState.get(name)
}

export function resolvePayload(payload: Payload): ResolvedPayload {
  const ruleToState = new Map<string, RuleConfigStates>()
  const globToConfigs = new Map<string, FlatConfigItem[]>()

  payload.configs.forEach((config, index) => {
    // Rule Level
    if (config.rules) {
      Object.entries(config.rules).forEach(([name, raw]) => {
        const value = getRuleLevel(raw)
        if (value) {
          const options = getRuleOptions(raw)
          if (!ruleToState.has(name))
            ruleToState.set(name, [])
          ruleToState.get(name)!.push({
            name,
            configIndex: index,
            level: value,
            options,
          })
        }
      })
    }

    // Globs
    for (const glob of config.files?.flat() || []) {
      if (!globToConfigs.has(glob))
        globToConfigs.set(glob, [])
      globToConfigs.get(glob)!.push(config)
    }
    for (const glob of config.ignores?.flat() || []) {
      if (!globToConfigs.has(glob))
        globToConfigs.set(glob, [])
      globToConfigs.get(glob)!.push(config)
    }
  })

  configsOpenState.value = payload.configs.length >= 10
    // collapse all if there are too many items
    ? payload.configs.map(() => false)
    : payload.configs.map(() => true)

  return {
    ...payload,
    configsIgnoreOnly: payload.configs.filter(i => isIgnoreOnlyConfig(i)),
    configsGeneral: payload.configs.filter(i => isGeneralConfig(i)),
    ruleToState,
    globToConfigs,
    filesResolved: resolveFiles(payload),
  }
}

function resolveFiles(payload: Payload): ResolvedPayload['filesResolved'] {
  if (!payload.files)
    return undefined

  const generalConfigIndex = payload.configs.filter(i => isGeneralConfig(i))
    .map(i => i.index)

  const files: string[] = []
  const globToFiles = new Map<string, Set<string>>()
  const fileToGlobs = new Map<string, Set<string>>()
  const fileToConfigs = new Map<string, Set<number>>()
  const configToFiles = new Map<number, Set<string>>()
  const filesGroupMap = new Map<string, FilesGroup>()

  for (const file of payload.files) {
    files.push(file.filepath)
    for (const glob of file.globs) {
      if (!globToFiles.has(glob))
        globToFiles.set(glob, new Set())
      globToFiles.get(glob)!.add(file.filepath)
      if (!fileToGlobs.has(file.filepath))
        fileToGlobs.set(file.filepath, new Set())
      fileToGlobs.get(file.filepath)!.add(glob)
    }
    for (const configIndex of file.configs) {
      if (!configToFiles.has(configIndex))
        configToFiles.set(configIndex, new Set())
      configToFiles.get(configIndex)!.add(file.filepath)
      if (!fileToConfigs.has(file.filepath))
        fileToConfigs.set(file.filepath, new Set())
      fileToConfigs.get(file.filepath)!.add(configIndex)
    }

    const specialConfigs = file.configs.filter(i => !generalConfigIndex.includes(i))
    const groupId = specialConfigs.join('-')
    if (!filesGroupMap.has(groupId)) {
      filesGroupMap.set(groupId, {
        id: groupId,
        files: [],
        configs: specialConfigs.map(i => payload.configs[i]),
        globs: new Set<string>(),
      })
    }
    const group = filesGroupMap.get(groupId)!
    group.files.push(file.filepath)
    file.globs.forEach(i => group.globs.add(i))
  }

  const groups = Array.from(filesGroupMap.values())
  fileGroupsOpenState.value = groups.map(() => true)

  return {
    list: files,
    globToFiles,
    fileToGlobs,
    fileToConfigs: new Map(Array.from(fileToConfigs.entries()).map(([file, configs]) => [file, Array.from(configs).sort().map(i => payload.configs[i])])),
    configToFiles,
    groups,
  }
}
