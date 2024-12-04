import { transformerNotationHighlight } from '@shikijs/transformers'

// @unocss-include
export default defineComponent({
  name: 'Shiki',
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
        theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
        transformers: [
          {
            pre(node) {
              node.properties.style = ''
            },
          },
          transformerNotationHighlight(),
        ],
      })
    })

    return () => h('div', {
      class: 'filter-hue-rotate-90',
      innerHTML: highlighted.value,
    })
  },
})
