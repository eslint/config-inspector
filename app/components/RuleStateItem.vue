<script setup lang="ts">
import type { RuleConfigState } from '~~/shared/types'
import { computed, reactive } from 'vue'
import { useRouter } from '#app/composables/router'
import { deepCompareOptions } from '~/composables/options'
import { getRuleDefaultOptions, payload } from '~/composables/payload'
import { filtersConfigs } from '~/composables/state'
import { nth, stringifyOptions } from '~/composables/strings'

const props = defineProps<{
  state: RuleConfigState
  isLocal?: boolean
}>()

const colors = {
  error: 'text-rose-700 dark:text-rose-300',
  warn: 'text-warning-700 dark:text-warning-300',
  off: 'color-muted',
}

const config = computed(() => payload.value.configs[props.state.configIndex]!)

const defaultOptions = computed(() => getRuleDefaultOptions(props.state.name))

const comparedOptions = computed(() => deepCompareOptions(props.state.options ?? [], defaultOptions.value))

const initialRuleOptionsView = computed(() => !props.state.options?.length && defaultOptions.value?.length ? 'default' : 'state')

const ruleOptions = reactive({
  viewType: initialRuleOptionsView.value as 'state' | 'default',
})

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
      <span v-if="state.level === 'off'" ml1 color-muted>Turned </span>
      <span v-else ml1 color-muted>Set to </span>
      <span font-mono :class="colors[state.level]">{{ state.level }}</span>
      <template v-if="!isLocal">
        <span color-muted>in</span>
        <button hover="!color-base" color-muted @click="goto()">
          <ColorizedConfigName
            v-if="config.name" :name="config.name"
            px2 font-mono border="~ base rounded"
          />
          <span color-muted> the </span>
          {{ nth(state.configIndex + 1) }}
          <span color-muted> config item </span>
        </button>
      </template>
      <div v-else color-muted>
        in this config
      </div>
    </div>
    <div v-if="!isLocal" flex="~ gap-2">
      <template v-if="config.files">
        <div i-ph-file-magnifying-glass-duotone my1 flex-none op75 />
        <div flex="~ col gap-2">
          <div color-muted>
            Applies to files matching
          </div>
          <div flex="~ gap-2 items-center wrap">
            <GlobItem v-for="entry, idx of config.files" :key="idx" :glob="entry" />
          </div>
        </div>
      </template>
      <template v-else-if="config.rules">
        <div i-ph-files-duotone my1 flex-none op75 />
        <div color-muted>
          Applied generally for all files
        </div>
      </template>
    </div>
    <template v-if="state.options?.length || defaultOptions?.length">
      <div items-center justify-between md:flex>
        <div flex="~ gap-1" color-muted>
          <button
            v-if="state.options?.length"
            btn-action
            :class="{ 'btn-action-active': ruleOptions.viewType === 'state' }"
            @click="ruleOptions.viewType = 'state'"
          >
            <div i-ph-sliders-duotone my1 flex-none op75 />
            Rule options
          </button>
          <button
            v-if="defaultOptions?.length"
            btn-action
            :class="{ 'btn-action-active': ruleOptions.viewType === 'default' }"
            @click="ruleOptions.viewType = 'default'"
          >
            <div i-ph-faders-duotone my1 flex-none op75 />
            Option defaults
          </button>
        </div>
      </div>
      <template v-if="ruleOptions.viewType === 'state'">
        <Shiki
          v-for="options, idx of comparedOptions.options"
          :key="idx"
          lang="ts"
          :code="stringifyOptions(options)"
          rounded bg-code p2 text-sm
        />
      </template>
      <template v-if="ruleOptions.viewType === 'default'">
        <Shiki
          v-for="options, idx of defaultOptions"
          :key="idx"
          lang="ts"
          :code="stringifyOptions(options)"
          rounded bg-code p2 text-sm
        />
      </template>
    </template>
    <template v-if="ruleOptions.viewType === 'state' && comparedOptions.hasRedundantOptions">
      <div color-muted>
        Options <span italic op75>italicized</span> match the default for the rule
      </div>
    </template>
  </div>
</template>
