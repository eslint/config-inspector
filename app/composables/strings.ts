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
