export const filtersConfigs = reactive<FiltersConfigsPage>({
  rule: '',
  filepath: '',
})

export const filtersRules = reactive({
  plugin: '',
  search: '',
  state: 'using' as 'using' | 'unused' | 'overloads' | '',
  status: 'active' as 'deprecated' | 'active' | '',
  fixable: null as boolean | null,
})

export const stateStorage = useLocalStorage(
  'eslint-config-viewer',
  {
    viewType: 'list' as 'list' | 'grid',
    viewFileMatchType: 'configs' as 'configs' | 'merged',
    showSpecificOnly: false,
  },
  { mergeDefaults: true },
)
