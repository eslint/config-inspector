/**
 * Indicates if any user-supplied option values match the default value for that option
 */
let hasRedundantOptions: boolean

/**
 * Wraps an option value in a 3-part array, while still preserving the original data type and value.
 *
 * The '--' markers provide something that a regex replace can easily later match on.
 * (See transformDiff() in ./strings.ts)
 */
function redundantOption(option: any) {
  hasRedundantOptions = true
  return ['--', option, '--']
}

function deepCompareOption(option: any, defaultOption: any) {
  if (defaultOption === void 0)
    return option
  if (typeof option !== typeof defaultOption)
    return option

  if (option === defaultOption)
    return redundantOption(option)

  if (typeof option === 'object' && option !== null && defaultOption !== null) {
    if (Array.isArray(option) && Array.isArray(defaultOption) && option.length === defaultOption.length) {
      if (option.length === 0)
        return redundantOption(option)
      return option.map((value: any, index: number): any[] => deepCompareOption(value, defaultOption[index]))
    }
    else if (!Array.isArray(option) && !Array.isArray(defaultOption)) {
      const optionKeys = Object.keys(option)

      return optionKeys.reduce((comparedKeys: Record<string, any>, key) => {
        comparedKeys[key] = deepCompareOption(option[key], defaultOption[key])
        return comparedKeys
      }, {})
    }
  }

  return option
}

export function deepCompareOptions(options: any[], defaultOptions: any[]) {
  hasRedundantOptions = false
  const comparedOptions = options.map((value, index) => deepCompareOption(value, index < defaultOptions.length ? defaultOptions[index] : void 0))

  return {
    options: comparedOptions,
    hasRedundantOptions,
  }
}
