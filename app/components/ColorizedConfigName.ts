import { computed, defineComponent, h } from 'vue'
import { getPluginColor } from '../composables/color'

export default defineComponent({
  props: {
    name: {
      type: String,
    },
    index: {
      type: Number,
    },
  },
  setup(props) {
    const groups = computed(() =>
      props.name?.split(' > ').map(g => g.split(/([:/])/g).filter(Boolean)),
    )
    return () => {
      if (groups.value) {
        const children: any[] = []
        groups.value.forEach((parts, gi) => {
          if (gi > 0) {
            children.push(h('span', {
              class: 'i-ph-caret-right inline-block op35',
              style: { margin: '0 0.25em', verticalAlign: '-0.1em' },
            }))
          }
          parts.forEach((part, i) => {
            children.push(h(
              'span',
              [':', '/'].includes(part)
                ? { style: { opacity: 0.35, margin: '0 1px' } }
                : i !== parts.length - 1
                  ? { style: { color: getPluginColor(part) } }
                  : null,
              part,
            ))
          })
        })
        return h('span', children)
      }
      else {
        return h('span', [
          h('span', { class: 'op50 italic' }, 'anonymous'),
          props.index != null
            ? h('span', { class: 'op50 text-sm' }, ` #${props.index + 1}`)
            : null,
        ])
      }
    }
  },
})

// @unocss-include
