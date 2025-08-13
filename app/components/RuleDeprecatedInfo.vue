<script lang="ts" setup>
import type { RuleInfo } from '~~/shared/types'
import { Dropdown as VDropdown } from 'floating-vue'
import { computed } from 'vue'

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
    'text-blue5 dark:text-blue4',
    url ? 'underline' : '',
  ]
}
</script>

<template>
  <VDropdown
    inline-block
    :disabled="!deprecatedInfo"
  >
    <div
      border="~ red/25 rounded"
      select-none bg-red:5 px1 text-xs text-red
    >
      {{ invalid ? 'INVALID' : 'DEPRECATED' }}
    </div>
    <template #popper="{ shown }">
      <div
        v-if="shown && deprecatedInfo"
        p-2 text-sm op75
      >
        <p v-if="deprecatedInfo.message" mb1 flex="~ gap-1" text-red>
          <span i-ph-warning-duotone inline-block />{{ deprecatedInfo.message }}
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
        <p mt2>
          <a text-red underline :href="deprecatedInfo.url">Learn more</a>
        </p>
      </div>
    </template>
  </VDropdown>
</template>
