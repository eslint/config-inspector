<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import { Dropdown as VDropdown } from 'floating-vue'
import { useHighlightedGlob } from '../composables/shiki'
import { filtersConfigs } from '~/composables/state'
import { useRouter } from '#app/composables/router'
import { payload } from '~/composables/payload'

const props = withDefaults(
  defineProps<{
    glob: string
    popup?: 'files' | 'configs'
    active?: boolean | null
  }>(),
  { active: null },
)

const highlighted = useHighlightedGlob(() => props.glob.toString())

const showsPopup = computed(() => (props.popup === 'files' && payload.value.filesResolved) || props.popup === 'configs')
const files = computed(() => props.popup === 'files'
  ? payload.value.filesResolved?.globToFiles.get(props.glob)
  : undefined)

const configs = computed(() => props.popup === 'configs'
  ? payload.value.globToConfigs.get(props.glob)
  : undefined,
)

const router = useRouter()
function goToConfig(idx: number) {
  filtersConfigs.filepath = ''
  router.push(`/configs?index=${idx + 1}`)
}

const Noop = defineComponent({ setup: (_, { slots }) => () => slots.default?.() })
</script>

<template>
  <component :is="showsPopup ? VDropdown : Noop">
    <component
      :is="showsPopup ? 'button' : 'div'"
      text-gray font-mono
      :class="active === true ? 'badge-active' : active === false ? 'badge op50' : 'badge'"
    >
      <span class="filter-hue-rotate-180" v-html="highlighted" />
    </component>
    <template #popper="{ shown, hide }">
      <div v-if="shown && popup === 'files'" max-h="30vh" min-w-80 of-auto p3>
        <div v-if="files?.size" flex="~ col gap-1">
          <div>Files that matches this glob</div>
          <FileItem
            v-for="file of files" :key="file"
            :filepath="file"
            font-mono
            @click="hide()"
          />
        </div>
        <div v-else text-center italic op50>
          No files matched this glob.
        </div>
      </div>

      <div v-if="shown && popup === 'configs'" max-h="30vh" min-w-80 of-auto p3>
        <div v-if="configs?.length" flex="~ col gap-1">
          <div>Configs that contains this glob</div>
          <div v-for="config of configs" :key="config.name" flex="~ gap-2">
            <button
              btn-badge
              @click="goToConfig(config.index)"
            >
              <ColorizedConfigName :name="config.name" :index="config.index" />
            </button>
          </div>
        </div>
        <div v-else text-center italic op50>
          No configs matched this glob.
        </div>
      </div>
    </template>
  </component>
</template>
