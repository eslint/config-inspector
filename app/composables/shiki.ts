import type { HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { createHighlighterCore } from 'shiki/core'
import { computed, shallowRef } from 'vue'
import { isDark } from './dark'

export const shiki = shallowRef<HighlighterCore>()

let _promise: Promise<HighlighterCore> | undefined

/**
 * Create the shared highlighter and populate the `shiki` ref.
 *
 * Kept as an explicit init step (instead of a top-level side effect) so that
 * importing this module stays side-effect free. Called once from `app.vue`,
 * and from the Storybook preview.
 */
export function initShiki(): Promise<HighlighterCore> {
  _promise ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/vitesse-light'),
      import('@shikijs/themes/vitesse-dark'),
    ],
    langs: [
      import('@shikijs/langs-precompiled/javascript'),
      import('@shikijs/langs-precompiled/typescript'),
      import('textmate-grammar-glob/grammars/glob.json') as any,
    ],
    engine: createJavaScriptRegexEngine(),
  }).then((highlighter) => {
    shiki.value = highlighter
    return highlighter
  })
  return _promise
}

export function useHighlightedGlob(code: () => string) {
  return computed(() => {
    if (!shiki.value)
      return sanitizeHtml(code())
    return shiki.value.codeToHtml(code(), {
      lang: 'glob',
      theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
      structure: 'inline',
    })
  })
}

export function sanitizeHtml(html: string) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
