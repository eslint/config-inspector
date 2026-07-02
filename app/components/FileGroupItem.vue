<script setup lang="ts">
import type { FilesGroup, GlobEntry } from '~~/shared/types'
import OverlayDropdown from '@antfu/design/components/Overlay/OverlayDropdown.vue'
import OverlayDropdownItem from '@antfu/design/components/Overlay/OverlayDropdownItem.vue'
import OverlayDropdownSeparator from '@antfu/design/components/Overlay/OverlayDropdownSeparator.vue'
import { computed, ref, watchEffect } from 'vue'
import { isSameGlobEntry } from '~~/shared/configs'
import { useRouter } from '#app/composables/router'
import ColorizedConfigName from '~/components/ColorizedConfigName'
import FileItem from '~/components/FileItem.vue'
import GlobItem from '~/components/GlobItem.vue'
import SummarizeItem from '~/components/SummarizeItem.vue'

const props = defineProps<{
  index: number
  group: FilesGroup
}>()

function isEntryInGroup(entry: GlobEntry): boolean {
  return props.group.globs.some(g => isSameGlobEntry(g, entry))
}

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

const groupName = computed(() => {
  if (props.group.configs.length === 1) {
    return {
      type: 'config',
      config: props.group.configs[0]!,
    } as const
  }
  if (props.group.globs.length <= 2) {
    return {
      type: 'glob',
      globs: props.group.globs,
    } as const
  }
  return undefined
})

const router = useRouter()
function goToConfig(idx: number) {
  router.push(`/configs?index=${idx + 1}`)
}
</script>

<template>
  <!-- @vue-ignore -->
  <details
    class="flat-config-item border border-base rounded-lg relative"
    :open="open"
    @toggle="open = $event.target.open"
  >
    <summary class="block">
      <div class="color-muted font-mono text-right right-[calc(100%+10px)] top-1.5 absolute lt-lg:hidden">
        #{{ index + 1 }}
      </div>
      <div class="text-sm font-mono px2 py2 bg-hover flex flex-wrap gap-2 cursor-pointer select-none items-center">
        <div class="i-ph-caret-right color-muted transition [details[open]_&]:rotate-90" />
        <div class="flex flex-auto flex-col gap-3 md:flex-row">
          <span class="flex flex-auto gap-2 items-center">
            <template v-if="groupName?.type === 'config'">
              <span class="color-muted">Config</span>
              <ColorizedConfigName
                class="badge"
                :name="groupName.config.name"
                :index="groupName.config.index"
              />
            </template>
            <template v-else-if="groupName?.type === 'glob'">
              <span class="color-muted">Globs</span>
              <GlobItem
                v-for="glob, idx of groupName.globs"
                :key="idx"
                :glob="glob"
              />
            </template>
            <span v-else class="color-muted">
              Files group #{{ index + 1 }}
            </span>
          </span>

          <div class="flex flex-wrap gap-2 items-start">
            <SummarizeItem
              icon="i-ph-files-duotone"
              :number="group.files?.length || 0"
              color="yellow"
              title="Files"
            />
            <SummarizeItem
              icon="i-ph-stack-duotone"
              :number="group.configs.length"
              color="blue"
              title="Configs"
              class="mr-2"
            />
          </div>
        </div>
      </div>
    </summary>

    <div
      aria-hidden="true" data-a11y-skip
      class="text-5em font-mono text-right op5 pointer-events-none right-2 top-2 absolute"
    >
      #{{ index + 1 }}
    </div>

    <div v-if="hasShown" class="px4 py4 flex flex-col gap-4 of-auto">
      <div class="flex gap-2 items-center">
        <div class="i-ph-stack-duotone flex-none" />
        <div>Configs Specific to the Files ({{ group.configs.length }})</div>
      </div>

      <div class="ml6 mt--2 flex flex-col gap-1">
        <div v-for="config, idx of group.configs" :key="idx" class="font-mono flex gap-2">
          <OverlayDropdown align="start">
            <template #trigger>
              <button class="badge text-start">
                <ColorizedConfigName :name="config.name" :index="idx" />
              </button>
            </template>
            <OverlayDropdownItem
              icon="i-ph-stack-duotone"
              @select="goToConfig(config.index)"
            >
              Go to this config
            </OverlayDropdownItem>
            <slot name="popup-actions" />
            <OverlayDropdownSeparator />
            <div class="p2 max-w-2xl">
              <div class="flex gap-2 items-start">
                <div class="i-ph-file-magnifying-glass-duotone color-muted my1 flex-none" />
                <div class="flex flex-col gap-2">
                  <div class="color-muted">
                    Applies to files matching
                  </div>
                  <div class="flex flex-wrap gap-2 items-center">
                    <GlobItem
                      v-for="entry, idx2 of config.files"
                      :key="idx2"
                      :glob="entry"
                      :active="isEntryInGroup(entry)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </OverlayDropdown>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div class="i-ph-file-magnifying-glass-duotone flex-none" />
        <div>Matched Globs</div>
      </div>

      <div class="ml6 mt--2 flex flex-wrap gap-1">
        <GlobItem v-for="glob, idx2 of group.globs" :key="idx2" :glob="glob" />
      </div>

      <div class="flex gap-2 items-center">
        <div class="i-ph-files-duotone flex-none" />
        <div>Matched Local Files ({{ group.files.length }})</div>
      </div>

      <div class="ml7 mt--2 flex flex-col gap-1">
        <FileItem v-for="file of group.files" :key="file" class="font-mono" :filepath="file" />
      </div>
    </div>
  </details>
</template>
