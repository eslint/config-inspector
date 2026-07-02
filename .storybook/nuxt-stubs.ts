import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'

/**
 * Minimal `NuxtLink` stand-in for Storybook: external URLs render as plain
 * anchors, internal paths go through `RouterLink` so active classes work.
 */
export const NuxtLink = defineComponent({
  name: 'NuxtLink',
  props: {
    to: { type: [String, Object] as PropType<RouteLocationRaw>, default: undefined },
    href: { type: [String, Object] as PropType<RouteLocationRaw>, default: undefined },
    target: { type: String, default: undefined },
    rel: { type: String, default: undefined },
    activeClass: { type: String, default: undefined },
    exactActiveClass: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const to = props.to ?? props.href
      const isExternal = typeof to === 'string' && /^\w+:/.test(to)
      if (to == null || isExternal || props.target === '_blank') {
        return h('a', {
          href: typeof to === 'string' ? to : undefined,
          target: props.target,
          rel: props.rel,
        }, slots.default?.())
      }
      return h(RouterLink, {
        to,
        activeClass: props.activeClass,
        exactActiveClass: props.exactActiveClass,
      }, slots.default)
    }
  },
})
