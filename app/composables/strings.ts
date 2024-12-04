export function nth(n: number) {
  const nString = `${n}`
  if (nString.endsWith('1') && n !== 11)
    return `${nString}st`
  if (nString.endsWith('2') && n !== 12)
    return `${nString}nd`
  if (nString.endsWith('3') && n !== 13)
    return `${nString}rd`
  return `${n}th`
}

export function stringifyUnquoted(obj: any) {
  return JSON.stringify(obj, null, 2)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, '\'')
}

/**
 * Replaces all occurrences of the pattern:
 * `['--', value, '--']`
 *
 * with:
 * `value, // [!code highlight]
 *
 * Lines with the [!code highlight] comment will be processed by Shiki's diff
 * notation transformer and have the `.line.highlighted` classes applied
 */
export function transformHighlight(code: string) {
  return code
    .replace(/\[\s*'--',\s*(\S.+),\s*'--'\s*\],?/g, '$1, // [!code highlight]')
}
