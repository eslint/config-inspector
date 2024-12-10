import type { FiltersConfigsPage } from '~~/shared/types'
import { breakpointsTailwind, useBreakpoints, useLocalStorage } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'

export const filtersConfigs = reactive<FiltersConfigsPage>({
  rule: '',
  filepath: '',
})

export const filtersRules = reactive({
  plugin: '',
  search: '',
  state: 'using' as 'using' | 'unused' | 'overloads' | 'error' | 'warn' | 'off' | 'off-only' | '',
  status: 'active' as 'deprecated' | 'active' | 'recommended' | 'fixable' | '',
  fixable: null as boolean | null,
})

export const stateStorage = useLocalStorage(
  'eslint-config-viewer',
  {
    viewType: 'list' as 'list' | 'grid',
    viewFileMatchType: 'configs' as 'configs' | 'merged',
    viewFilesTab: 'list' as 'list' | 'group',
    showSpecificOnly: true,
  },
  { mergeDefaults: true },
)

const bp = useBreakpoints(breakpointsTailwind)
export const bpSm = bp.smallerOrEqual('md')

export const isGridView = computed(() => bpSm.value || stateStorage.value.viewType === 'grid')

export const configsOpenState = ref<boolean[]>([])
export const fileGroupsOpenState = ref<boolean[]>([])
