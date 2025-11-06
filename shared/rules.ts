import type { Linter } from 'eslint'

export function getRuleLevel(level: Linter.RuleEntry | undefined) {
  const first = Array.isArray(level) ? level[0] : level
  switch (first) {
    case 0:
    case 'off':
      return 'off'
    case 1:
    case 'warn':
      return 'warn'
    case 2:
    case 'error':
      return 'error'
  }
  return 'off'
}

export function getRuleOptions<T extends any[]>(level: Linter.RuleEntry<T> | undefined): T | undefined {
  if (Array.isArray(level))
    return level.slice(1) as T
}
