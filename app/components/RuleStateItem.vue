<script setup lang="ts">
import { computed } from 'vue'
import { nth, stringifyUnquoted } from '~/composables/strings'
import { filtersConfigs } from '~/composables/state'
import { payload } from '~/composables/payload'
import { useRouter } from '#app/composables/router'
import type { RuleConfigState } from '~~/shared/types'
import { Shiki } from '~/composables/shiki'

const props = defineProps<{
  state: RuleConfigState
  isLocal?: boolean
}>()

const colors = {
  error: 'text-red',
  warn: 'text-amber',
  off: 'text-gray',
}

const config = computed(() => payload.value.configs[props.state.configIndex])

const router = useRouter()
function goto() {
  filtersConfigs.rule = props.state.name
  router.push('/configs')
}
</script>

<template>
  <div min-w-100 p4 flex="~ col gap-2">
    <div flex="~ gap-1 items-center">
      <RuleLevelIcon
        :level="state.level"
        :config-index="state.configIndex"
      />
      <span v-if="state.level === 'off'" ml1 op50>Turned </span>
      <span v-else ml1 op50>Set to </span>
      <span font-mono :class="colors[state.level]">{{ state.level }}</span>
      <template v-if="!isLocal">
        <span op50>in</span>
        <button hover="!color-base" text-gray @click="goto()">
          <ColorizedConfigName
            v-if="config.name" :name="config.name"
            font-mono px2 border="~ base rounded"
          />
          <span op50> the </span>
          {{ nth(state.configIndex + 1) }}
          <span op50> config item </span>
        </button>
      </template>
      <div v-else op50>
        in this config
      </div>
    </div>
    <div v-if="!isLocal" flex="~ gap-2">
      <template v-if="config.files">
        <div i-ph-file-magnifying-glass-duotone my1 flex-none op75 />
        <div flex="~ col gap-2">
          <div op50>
            Applies to files matching
          </div>
          <div flex="~ gap-2 items-center wrap">
            <GlobItem v-for="glob, idx of config.files?.flat()" :key="idx" :glob="glob" />
          </div>
        </div>
      </template>
      <template v-else-if="config.rules">
        <div i-ph-files-duotone my1 flex-none op75 />
        <div op50>
          Applied generally for all files
        </div>
      </template>
    </div>
    <template v-if="state.options?.length">
      <div flex="~ gap-2 items-center">
        <div i-ph-sliders-duotone my1 flex-none op75 />
        <div op50>
          Rule options
        </div>
      </div>
      <Shiki
        v-for="options, idx of state.options"
        :key="idx"
        lang="ts"
        :code="stringifyUnquoted(options)"
        rounded bg-code p2 text-sm
      />
    </template>
  </div>
</template>
