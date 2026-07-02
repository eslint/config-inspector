import { defaultBrandHues, stripPluginPrefix } from '@antfu/design/utils/color'
import { isDark } from './dark'

/**
 * ESLint-specific brand hues, merged over `@antfu/design`'s defaults
 * (which already cover vue, react, svelte, ts, js, node, ...).
 */
const brandHues: Record<string, number> = {
  ...defaultBrandHues,
  '@typescript-eslint': 211,
  'n': 120,
  'antfu': 170,
  'markdown': 270,
}

/** Config entries that should render muted gray rather than a brand color. */
const mutedNames = new Set(['ignore', 'ignores', 'disable', 'disables'])

/**
 * Dark-aware `hsla()` for a hue. Saturation/lightness stops are the app's
 * original contrast-tuned values (WCAG AA against `bg-base` in both schemes) —
 * intentionally darker/lighter than `@antfu/design`'s defaults.
 */
function getHsla(hue: number, opacity: number | string = 1): string {
  const saturation = isDark.value ? 55 : 70
  const lightness = isDark.value ? 72 : 28
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`
}

function getHashHue(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return ((hash % 360) + 360) % 360
}

export function getPluginColor(name: string, opacity = 1): string {
  if (mutedNames.has(name)) {
    if (opacity === 1)
      return '#888888'
    const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0')
    return `#888888${opacityHex}`
  }
  const bare = stripPluginPrefix(name).toLowerCase()
  const key = Object.keys(brandHues).find(k => bare === k || bare.startsWith(`${k}-`) || bare.startsWith(`${k}.`))
  const hue = key != null ? brandHues[key]! : getHashHue(name)
  return getHsla(hue, opacity)
}
