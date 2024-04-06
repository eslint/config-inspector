/* eslint-disable no-console */
import { $fetch } from 'ofetch'
import { getMatchedConfigs, isIgnoreOnlyConfig } from '~~/shared/configs'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'
import type { ErrorInfo, FileConfigMatchResult, FilesGroup, Payload, ResolvedPayload, RuleConfigStates, RuleInfo } from '~~/shared/types'

const LOG_NAME = '[ESLint Config Inspector]'

const data = ref<Payload>({
  rules: {},
  configs: [],
  meta: {} as any,
  files: [],
})

export const errorInfo = ref<ErrorInfo>()

function isErrorInfo(payload: Payload | ErrorInfo): payload is ErrorInfo {
  return 'error' in payload
}

async function get() {
  const payload = await $fetch<Payload | ErrorInfo>('/api/payload.json')
  if (isErrorInfo(payload)) {
    errorInfo.value = payload
    return
  }
  errorInfo.value = undefined
  data.value = payload
  console.log(LOG_NAME, 'Config payload', payload)
  return payload
}

const _promises = get()
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
          get()
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

export function ensureDataFetch() {
  return _promises
}

export const payload = computed(() => Object.freeze(resolvePayload(data.value!)))

export function getRuleFromName(name: string): RuleInfo | undefined {
  return payload.value.rules[name]
}

export function getRuleStates(name: string): RuleConfigStates | undefined {
  return payload.value.ruleStateMap.get(name)
}

export function resolvePayload(payload: Payload): ResolvedPayload {
  const ruleStateMap = new Map<string, RuleConfigStates>()
  payload.configs.forEach((config, index) => {
    if (!config.rules)
      return
    Object.entries(config.rules).forEach(([name, raw]) => {
      const value = getRuleLevel(raw)
      if (!value)
        return
      const options = getRuleOptions(raw)
      if (!ruleStateMap.has(name))
        ruleStateMap.set(name, [])
      ruleStateMap.get(name)!.push({
        name,
        configIndex: index,
        level: value,
        options,
      })
    })
  })

  const generalConfigs = payload.configs
    .map((config, idx) => (!config.files && !config.ignores) || isIgnoreOnlyConfig(config) ? idx : undefined)
    .filter((idx): idx is number => idx !== undefined)

  const filesMatchedConfigsMap = new Map<string, FileConfigMatchResult[]>()
  payload.files.forEach((file) => {
    filesMatchedConfigsMap.set(file, getMatchedConfigs(file, payload.configs))
  })

  const filesGroupMap = new Map<string, FilesGroup>()
  for (const [file, values] of filesMatchedConfigsMap.entries()) {
    const configs = values.sort((a, b) => a.index - b.index).filter(i => !generalConfigs.includes(i.index))
    const id = configs.map(i => i.index).join('-')
    if (!filesGroupMap.has(id)) {
      filesGroupMap.set(id, {
        id,
        files: [],
        configs: configs.map(i => payload.configs[i.index]),
        globs: new Set(),
      })
    }
    const item = filesGroupMap.get(id)!
    item.files.push(file)
    values.forEach(i =>
      i.globs.forEach(glob =>
        item.globs.add(glob),
      ),
    )
  }

  configsOpenState.value = payload.configs.length >= 10
    // collapse all if there are too many items
    ? payload.configs.map(() => false)
    : payload.configs.map(() => true)

  return {
    ...payload,
    ruleStateMap,
    filesMatchedConfigsMap,
    filesGroup: [...filesGroupMap.values()],
  }
}
