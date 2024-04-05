<script setup lang="ts">
import { defineModel, ref, watchEffect } from 'vue'
import { payload } from '../composables/payload'
import { useRouter } from '#app/composables/router'
import type { FilesGroup } from '~~/types'

defineProps<{
  index: number
  group: FilesGroup
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
function goToConfig(idx: number) {
  router.push(`/configs?index=${idx + 1}`)
}
</script>

<template>
  <details
    class="flat-config-item"
    :open="open"
    border="~ base rounded-lg" relative
    @toggle="open = $event.target.open"
  >
    <summary block>
      <div class="absolute right-[calc(100%+10px)] top-1.5" text-right font-mono op35 lt-lg:hidden>
        #{{ index + 1 }}
      </div>
      <div flex="~ gap-2 items-start wrap items-center" cursor-pointer select-none bg-hover px2 py2 text-sm font-mono>
        <div i-ph-caret-right class="[details[open]_&]:rotate-90" transition op50 />
        <div flex flex-col gap-3 md:flex-row flex-auto>
          <span op50 flex-auto>
            <span>Files group #{{ index + 1 }}</span>
          </span>

          <div flex="~ gap-2 items-start wrap">
            <SummarizeItem
              icon="i-ph-files-duotone"
              :number="group.files?.length || 0"
              color="text-yellow5"
              title="Files"
            />
            <SummarizeItem
              icon="i-ph-stack-duotone"
              :number="group.configs.length"
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

    <div v-if="hasShown" px4 py4 flex="~ col gap-4" of-auto>
      <div flex="~ gap-2 items-center">
        <div i-ph-files-duotone flex-none />
        <div>Matched Local Files ({{ group.files.length }})</div>
      </div>

      <div flex="~ col gap-1" ml7 mt--2>
        <FileItem v-for="file of group.files" :key="file" font-mono :filepath="file" />
      </div>

      <div flex="~ gap-2 items-center">
        <div i-ph-stack-duotone flex-none />
        <div>Configs specific to files ({{ group.configs.length }})</div>
      </div>
      <div flex="~ col gap-1" ml6 mt--2>
        <div v-for="configIdx of group.configs" :key="configIdx" font-mono flex="~ gap-2">
          <VDropdown>
            <button border="~ base rounded px2" flex="~ gap-2 items-center" hover="bg-active" px2 py0.5>
              <ColorizedConfigName v-if="payload.configs[configIdx].name" :name="payload.configs[configIdx].name!" />
              <div v-else op50 italic>
                anonymous
              </div>
              <div op50 text-sm>
                #{{ configIdx + 1 }}
              </div>
            </button>
            <template #popper="{ shown }">
              <div v-if="shown" max-h="50vh" min-w-100>
                <div flex="~ items-center gap-2" p3>
                  <button
                    action-button
                    title="Copy"
                    @click="goToConfig(configIdx)"
                  >
                    <div i-ph-stack-duotone />
                    Go to this config
                  </button>
                  <slot name="popup-actions" />
                </div>
                <div p3 border="t base">
                  <div flex="~ gap-2 items-start">
                    <div i-ph-file-magnifying-glass-duotone my1 flex-none op75 />
                    <div flex="~ col gap-2">
                      <div op50>
                        Applies to files matching
                      </div>
                      <div flex="~ gap-2 items-center wrap">
                        <GlobItem v-for="glob, idx of payload.configs[configIdx].files" :key="idx" :glob="glob" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </VDropdown>
        </div>
      </div>
    </div>
  </details>
</template>
