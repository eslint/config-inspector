<script setup lang="ts">
import ActionButton from '@antfu/design/components/Action/ActionButton.vue'
import ActionToggleGroup from '@antfu/design/components/Action/ActionToggleGroup.vue'
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import { computed } from 'vue'
import FileGroupItem from '~/components/FileGroupItem.vue'
import FileItem from '~/components/FileItem.vue'
import { payload } from '~/composables/payload'
import { fileGroupsOpenState, stateStorage } from '../composables/state'

const viewFilesTab = computed<string | string[] | undefined>({
  get: () => stateStorage.value.viewFilesTab,
  set: (value) => {
    // Ignore deselection so one tab always stays active.
    if (value === 'list' || value === 'group')
      stateStorage.value.viewFilesTab = value
  },
})

function expandAll() {
  fileGroupsOpenState.value = fileGroupsOpenState.value.map(() => true)
}

function collapseAll() {
  fileGroupsOpenState.value = fileGroupsOpenState.value.map(() => false)
}
</script>

<template>
  <div v-if="payload.filesResolved" class="my4 flex flex-col gap-4">
    <div class="color-muted">
      This tab shows the preview for files match from the workspace.
      This feature is <span class="text-warning-700 dark:text-warning-300">experimental</span> and may not be 100% accurate.
    </div>
    <div class="flex gap-2 items-center">
      <ActionToggleGroup
        v-model="viewFilesTab"
        :options="[
          { value: 'list', label: 'List', icon: 'i-ph-files-duotone' },
          { value: 'group', label: 'File Groups', icon: 'i-ph-rows-duotone' },
        ]"
      />
      <div class="flex-auto" />
      <template v-if="stateStorage.viewFilesTab === 'group'">
        <ActionButton class="px3" @click="expandAll">
          Expand All
        </ActionButton>
        <ActionButton class="px3" @click="collapseAll">
          Collapse All
        </ActionButton>
      </template>
    </div>

    <div v-if="stateStorage.viewFilesTab === 'group'" class="flex flex-col gap-2">
      <FileGroupItem
        v-for="group, idx of payload.filesResolved.groups"
        :key="group.id"
        v-model:open="fileGroupsOpenState[idx]"
        :group="group"
        :index="idx"
      />
    </div>
    <div v-else>
      <div class="flex gap-2 items-center">
        <div class="i-ph-files-duotone flex-none" />
        <div>Matched Local Files ({{ payload.filesResolved.list.length }})</div>
      </div>
      <div class="font-mono py4 flex flex-col gap-1">
        <FileItem v-for="file of payload.filesResolved.list" :key="file" :filepath="file" />
      </div>
    </div>
  </div>
  <FeedbackEmptyState
    v-else
    icon="i-ph-files-duotone"
    title="No matched files found in the workspace."
  />
</template>
