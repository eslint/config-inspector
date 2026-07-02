<script lang="ts" setup>
import type { RuleInfo } from '~~/shared/types'
import DisplayBadge from '@antfu/design/components/Display/DisplayBadge.vue'
import OverlayHoverCard from '@antfu/design/components/Overlay/OverlayHoverCard.vue'
import { computed } from 'vue'
import { NuxtLink } from '#components'

const {
  deprecated,
  invalid,
} = defineProps<{
  deprecated: RuleInfo['deprecated']
  invalid: RuleInfo['invalid'] | undefined
}>()

const deprecatedInfo = computed(() => {
  if (!deprecated || typeof deprecated === 'boolean')
    return

  return deprecated
})

const versionInfo = computed(() => {
  if (!deprecatedInfo.value)
    return

  let res = ''

  if (deprecatedInfo.value.deprecatedSince)
    res += `was deprecated in v${deprecatedInfo.value.deprecatedSince}`

  if (deprecatedInfo.value.availableUntil) {
    if (res)
      res += ', and '

    res += `will be removed in v${deprecatedInfo.value.availableUntil}`
  }
  return `This rule ${res}.`
})

function getLinkClass(url: string | undefined) {
  return [
    'text-blue-700 dark:text-blue-300',
    url ? 'underline' : '',
  ]
}
</script>

<template>
  <OverlayHoverCard v-if="deprecatedInfo" placement="bottom" align="start">
    <template #trigger>
      <DisplayBadge color="red" class="select-none">
        {{ invalid ? 'INVALID' : 'DEPRECATED' }}
      </DisplayBadge>
    </template>
    <div class="text-sm color-base">
      <p v-if="deprecatedInfo.message" class="color-scale-critical mb1 flex gap-1">
        <span class="i-ph-warning-duotone inline-block" />{{ deprecatedInfo.message }}
      </p>
      <p v-if="versionInfo">
        {{ versionInfo }}
      </p>
      <p v-if="deprecatedInfo.replacedBy?.length">
        Please use the
        <template v-for="({ rule, plugin }, i) in deprecatedInfo.replacedBy">
          <NuxtLink
            v-if="rule"
            :key="rule.name"
            :class="getLinkClass(rule.url)"
            :href="rule.url"
            target="_blank"
          >
            {{ rule.name ?? rule.url }}
          </NuxtLink>
          <template v-if="plugin">
            in
            <NuxtLink
              :key="plugin.name"
              :class="getLinkClass(plugin.url)"
              :href="plugin.url"
              target="_blank"
            >
              {{ plugin.name ?? plugin.url }}
            </NuxtLink>
          </template>{{ i === deprecatedInfo.replacedBy.length - 1 ? '.' : i === 0 ? '' : ', ' }}
        </template>
      </p>
      <p class="mt2">
        <a class="color-scale-critical underline" target="_blank" :href="deprecatedInfo.url">Learn more</a>
      </p>
    </div>
  </OverlayHoverCard>
  <DisplayBadge v-else color="red" class="select-none">
    {{ invalid ? 'INVALID' : 'DEPRECATED' }}
  </DisplayBadge>
</template>
