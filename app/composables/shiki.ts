import type { HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import { createHighlighterCore } from 'shiki/core'
import { computed, shallowRef } from 'vue'
import { isDark } from './dark'

export const shiki = shallowRef<HighlighterCore>()

createHighlighterCore({
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
})

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
