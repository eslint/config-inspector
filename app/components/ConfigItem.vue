<script setup lang="ts">
import { computed, defineModel, ref, watchEffect } from 'vue'
import { filtersRules, isGridView } from '~/composables/state'
import { stringifyUnquoted } from '~/composables/strings'
import { useRouter } from '#app/composables/router'
import type { FiltersConfigsPage, FlatESLintConfigItem } from '~~/shared/types'
import { getRuleLevel, getRuleOptions } from '~~/shared/rules'

const props = defineProps<{
  config: FlatESLintConfigItem
  index: number
  filters?: FiltersConfigsPage
  active?: boolean
}>()

const emit = defineEmits<{
  badgeClick: [string]
}>()

const open = defineModel('open', {
  default: true,
})

const hasShown = ref(open.value)
if (!hasShown.value) {
  const stop = watchEffect(() => {
    if (open.value) {
      hasShown.value = true
      stop()
    }
  })
}

const router = useRouter()
function gotoPlugin(name: string) {
  filtersRules.plugin = name
  router.push('/rules')
}

const extraConfigs = computed(() => {
  const ignoredKeys = ['files', 'plugins', 'ignores', 'rules', 'name']
  return Object.fromEntries(
    Object.entries(props.config)
      .filter(([key]) => !ignoredKeys.includes(key)),
  )
})
</script>

<template>
  <details
    class="flat-config-item"
    :open="open"
    border="~ rounded-lg" relative
    :class="active ? 'border-yellow:70' : 'border-base'"
    @toggle="open = $event.target.open"
  >
    <summary block>
      <div class="absolute right-[calc(100%+10px)] top-1.5" text-right font-mono op35 lt-lg:hidden>
        #{{ index + 1 }}
      </div>
      <div flex="~ gap-2 items-start wrap items-center" cursor-pointer select-none bg-hover px2 py2 text-sm font-mono>
        <div i-ph-caret-right class="[details[open]_&]:rotate-90" transition op50 />
        <div flex flex-col gap-3 md:flex-row flex-auto>
          <span :class="config.name ? '' : 'op50 italic'" flex-auto>
            <ColorizedConfigName v-if="config.name" :name="config.name" />
            <span v-else>anonymous #{{ index + 1 }}</span>
          </span>

          <div flex="~ gap-2 items-start wrap">
            <SummarizeItem
              icon="i-ph-file-magnifying-glass-duotone"
              :number="config.files?.length || 0"
              color="text-yellow5"
              title="Files"
            />
            <SummarizeItem
              icon="i-ph-eye-closed-duotone"
              :number="config.ignores?.length || 0"
              color="text-purple5 dark:text-purple4"
              title="Ignores"
            />
            <SummarizeItem
              icon="i-ph-sliders-duotone"
              :number="Object.keys(extraConfigs).length"
              color="text-green5"
              title="Options"
            />
            <SummarizeItem
              icon="i-ph-plug-duotone"
              :number="Object.keys(config.plugins || {}).length"
              color="text-teal5"
              title="Plugins"
            />
            <SummarizeItem
              icon="i-ph-list-dashes-duotone"
              :number="Object.keys(config.rules || {}).length"
              color="text-blue5 dark:text-blue4"
              title="Rules"
              mr-2
            />
          </div>
        </div>
      </div>
    </summary>

    <div absolute right-2 top-2 text-right text-5em font-mono op5 pointer-events-none>
      #{{ index + 1 }}
    </div>

    <div v-if="hasShown" px4 py3 flex="~ col gap-4" of-auto>
      <div v-if="config.files" flex="~ gap-2 items-start">
        <div i-ph-file-magnifying-glass-duotone my1 flex-none />
        <div flex="~ col gap-2">
          <div>Applies to files matching</div>
          <div flex="~ gap-2 items-center wrap">
            <GlobItem v-for="glob, idx of config.files?.flat()" :key="idx" :glob="glob" />
          </div>
        </div>
      </div>
      <div v-else-if="config.rules || Object.keys(extraConfigs).length" flex="~ gap-2 items-center">
        <div i-ph-files-duotone flex-none />
        <div>Generally applies to all files</div>
      </div>
      <div v-if="config.plugins" flex="~ gap-2 items-start">
        <div i-ph-plug-duotone my1 flex-none />
        <div flex="~ col gap-2">
          <div>Plugins ({{ Object.keys(config.plugins).length }})</div>
          <div flex="~ gap-2 items-center wrap">
            <button
              v-for="name, idx of Object.keys(config.plugins)"
              :key="idx" border="~ base rounded-full" px3
              :style="{ color: getPluginColor(name), backgroundColor: getPluginColor(name, 0.1) }"
              font-mono
              @click="gotoPlugin(name)"
            >
              {{ name }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="config.ignores" flex="~ gap-2 items-start">
        <div i-ph-eye-closed-duotone my1 flex-none />
        <div flex="~ col gap-2">
          <div v-if="!config.files">
            Ignore files globally
          </div>
          <div v-else>
            Ignore
          </div>
          <div flex="~ gap-2 items-center wrap">
            <GlobItem v-for="glob, idx of config.ignores" :key="idx" :glob="glob" />
          </div>
        </div>
      </div>
      <div v-else-if="config.rules">
        <div flex="~ gap-2 items-center">
          <div i-ph-list-dashes-duotone my1 flex-none />
          <div>Rules ({{ Object.keys(config.rules).length }})</div>
        </div>
        <RuleList
          py2
          :class="isGridView ? 'pl6' : ''"
          :rules="config.rules"
          :filter="name => !filters?.rule || filters.rule === name"
          :get-bind="(name: string) => ({ class: getRuleLevel(config.rules?.[name]) === 'off' ? 'op50' : '' })"
        >
          <template #popup="{ ruleName, value }">
            <RuleStateItem
              border="t base"
              :is-local="true"
              :state="{
                name: ruleName,
                level: getRuleLevel(value)!,
                configIndex: index,
                options: getRuleOptions(value),
              }"
            />
          </template>
          <template #popup-actions="{ ruleName }">
            <button
              v-close-popper
              btn-action-sm
              @click="emit('badgeClick', ruleName)"
            >
              <div i-ph-funnel-duotone />
              Filter by this rule
            </button>
          </template>
        </RuleList>
        <div>
          <button v-if="filters?.rule" ml8 op50 @click="emit('badgeClick', '')">
            ...{{ Object.keys(config.rules).filter(r => r !== filters?.rule).length }} others rules are hidden
          </button>
        </div>
      </div>

      <div v-if="Object.keys(extraConfigs).length" flex="~ gap-2">
        <div i-ph-sliders-duotone my1 flex-none />
        <div flex="~ col gap-2" w-full>
          <div>
            Additional configurations
          </div>
          <template v-for="v, k in extraConfigs" :key="k">
            <div border="~ base rounded-lg">
              <div p2 px3 op50 of-auto>
                {{ k }}
              </div>
              <Shiki
                lang="ts" :code="stringifyUnquoted(v)"
                max-h-100 max-w-full w-full of-scroll rounded bg-code p2 text-sm
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </details>
</template>
