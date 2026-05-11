/* eslint-disable no-console */
import type { ErrorInfo, FilesGroup, FlatConfigItem, GlobEntry, Payload, ResolvedPayload, RuleConfigStates, RuleInfo } from '~~/shared/types'
import { defineRpcFunction } from 'devframe'
import { connectDevframe } from 'devframe/client'
import { computed, ref } from 'vue'
import { isGeneralConfig, isIgnoreOnlyConfig } from '~~/shared/configs'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'
import { configsOpenState, fileGroupsOpenState } from './state'

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

let _rpc: Awaited<ReturnType<typeof connectDevframe>> | undefined

async function get() {
  isFetching.value = true
  const payload = await (_rpc!.call as any)('eslint-config-inspector:get-payload') as Payload | ErrorInfo
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
  _promise = (async () => {
    _rpc = await connectDevframe({ baseURL })
    _rpc.client.register(defineRpcFunction({
      name: 'eslint-config-inspector:invalidate',
      type: 'event',
      handler: (path?: string) => {
        console.log(LOG_NAME, 'Config change detected', path)
        void get()
      },
    }) as any)
    return get()
  })()
}

export function ensureDataFetch() {
  return _promise
}

export const payload = computed(() => Object.freeze(resolvePayload(data.value!)))

export function getRuleFromName(name: string): RuleInfo {
  return payload.value.rules[name] || {
    name,
    invalid: true,
  } as RuleInfo
}

export function getRuleDefaultOptions(name: string): any[] {
  return payload.value.rules[name]?.defaultOptions ?? []
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

    // Globs — `globToConfigs` is a per-pattern reverse-lookup map.
    // Compound (intersection) entries from `config.files` are split into
    // their constituent patterns here; compound badges in the UI compute
    // their own intersection from `globToFiles` instead of reading this map.
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

function globEntryKey(g: GlobEntry): string {
  return Array.isArray(g) ? `[${g.join('\x00')}]` : g
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
  // Track per-group glob entries by their key so compound entries can be
  // deduplicated while preserving their AND grouping for display.
  const groupGlobKeys = new Map<string, Set<string>>()

  for (const file of payload.files) {
    files.push(file.filepath)
    for (const entry of file.globs) {
      // Per-pattern lookups (compound entries are expanded to their members,
      // which are guaranteed to have matched the file since the intersection
      // matched).
      const patterns = Array.isArray(entry) ? entry : [entry]
      for (const p of patterns) {
        if (!globToFiles.has(p))
          globToFiles.set(p, new Set())
        globToFiles.get(p)!.add(file.filepath)
        if (!fileToGlobs.has(file.filepath))
          fileToGlobs.set(file.filepath, new Set())
        fileToGlobs.get(file.filepath)!.add(p)
      }
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
        configs: specialConfigs.map(i => payload.configs[i]!),
        globs: [],
      })
      groupGlobKeys.set(groupId, new Set())
    }
    const group = filesGroupMap.get(groupId)!
    const seenKeys = groupGlobKeys.get(groupId)!
    group.files.push(file.filepath)
    for (const entry of file.globs) {
      const k = globEntryKey(entry)
      if (!seenKeys.has(k)) {
        seenKeys.add(k)
        group.globs.push(entry)
      }
    }
  }

  const groups = Array.from(filesGroupMap.values())
  fileGroupsOpenState.value = groups.map(() => true)

  return {
    list: files,
    globToFiles,
    fileToGlobs,
    fileToConfigs: new Map(Array.from(fileToConfigs.entries()).map(([file, configs]) => [file, Array.from(configs).sort((a, b) => a - b).map(i => payload.configs[i]!)])),
    configToFiles,
    groups,
  }
}
