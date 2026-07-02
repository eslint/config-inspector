import { useDark } from '@vueuse/core'
import { computed } from 'vue'

let dark: ReturnType<typeof useDark> | undefined

/**
 * `useDark` reads localStorage and mutates the root element class, so the
 * instance is created lazily on first access to keep importing this module
 * side-effect free.
 */
function ensureDark() {
  dark ??= useDark()
  return dark
}

/**
 * Apply the persisted color scheme to the document. Called once from `app.vue`.
 */
export function initDark() {
  ensureDark()
}

export const isDark = computed<boolean>({
  get: () => ensureDark().value,
  set: (value) => {
    ensureDark().value = value
  },
})

export function toggleDark() {
  isDark.value = !isDark.value
}
