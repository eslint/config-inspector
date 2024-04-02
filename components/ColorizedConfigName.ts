export default defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const parts = computed(() => props.name.split(/([:/])/g).filter(Boolean))
    return () => h('span', parts.value.map((part, i) => {
      return h(
        'span',
        [':', '/'].includes(part)
          ? { style: { opacity: 0.35, margin: '0 1px' } }
          : i !== parts.value.length - 1
            ? { style: { color: getPluginColor(part) } }
            : null,
        part,
      )
    }))
  },
})
