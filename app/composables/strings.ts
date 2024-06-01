export function nth(n: number) {
  if (n === 1)
    return '1st'
  if (n === 2)
    return '2nd'
  if (n === 3)
    return '3rd'
  return `${n}th`
}

export function stringifyUnquoted(obj: any) {
  return JSON.stringify(obj, null, 2)
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, '\'')
}
