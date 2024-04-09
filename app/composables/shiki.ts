import type { HighlighterCore } from 'shiki/core'
import { getHighlighterCore } from 'shiki/core'

const shiki = shallowRef<HighlighterCore>()

getHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-light.mjs'),
    import('shiki/themes/vitesse-dark.mjs'),
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('textmate-grammar-glob/grammars/glob.json') as any,
  ],
  loadWasm: import('shiki/wasm'),
}).then((highlighter) => {
  shiki.value = highlighter
})

export function useHighlightedGlob(code: () => string) {
  return computed(() => {
    if (!shiki.value)
      return sanitizeHtml(code())
    return shiki.value.codeToHtml(code(), {
      lang: 'glob',
      theme: isDark ? 'vitesse-dark' : 'vitesse-light',
      transformers: [
        {
          root(node) {
            node.children = [
              (node.children[0] as any).children[0],
            ]
          },
        },
      ],
    })
  })
}

export const Shiki = defineComponent({
  props: {
    code: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const highlighted = computed(() => {
      if (!shiki.value)
        return sanitizeHtml(props.code)
      return shiki.value.codeToHtml(props.code, {
        lang: props.lang,
        theme: isDark ? 'vitesse-dark' : 'vitesse-light',
        transformers: [
          {
            pre(node) {
              node.properties.style = ''
            },
          },
        ],
      })
    })

    return () => h('div', { innerHTML: highlighted.value })
  },
})

function sanitizeHtml(html: string) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
