<script setup lang="ts">
import { payload } from '~/composables/payload'
import { fileGroupsOpenState, stateStorage } from '../composables/state'

function expandAll() {
  fileGroupsOpenState.value = fileGroupsOpenState.value.map(() => true)
}

function collapseAll() {
  fileGroupsOpenState.value = fileGroupsOpenState.value.map(() => false)
}
</script>

<template>
  <div v-if="payload.filesResolved" flex="~ col gap-4" my4>
    <div text-gray:75>
      This tab shows the preview for files match from the workspace.
      This feature is <span text-amber>experimental</span> and may not be 100% accurate.
    </div>
    <div flex="~ gap-2 items-center">
      <div border="~ base rounded" flex="~ inline">
        <button
          :class="stateStorage.viewFilesTab === 'list' ? 'btn-action-active' : 'op50'"
          btn-action border-none
          @click="stateStorage.viewFilesTab = 'list'"
        >
          <div i-ph-files-duotone />
          <span>List</span>
        </button>
        <div border="l base" />
        <button
          :class="stateStorage.viewFilesTab === 'group' ? 'btn-action-active' : 'op50'"
          btn-action border-none
          @click="stateStorage.viewFilesTab = 'group' "
        >
          <div i-ph-rows-duotone />
          <span>File Groups</span>
        </button>
      </div>
      <div flex-auto />
      <template v-if="stateStorage.viewFilesTab === 'group'">
        <button
          btn-action px3
          @click="expandAll"
        >
          Expand All
        </button>
        <button
          btn-action px3
          @click="collapseAll"
        >
          Collapse All
        </button>
      </template>
    </div>

    <div v-if="stateStorage.viewFilesTab === 'group'" flex="~ gap-2 col">
      <FileGroupItem
        v-for="group, idx of payload.filesResolved.groups"
        :key="group.id"
        v-model:open="fileGroupsOpenState[idx]"
        :group="group"
        :index="idx"
      />
    </div>
    <div v-else>
      <div flex="~ gap-2 items-center">
        <div i-ph-files-duotone flex-none />
        <div>Matched Local Files ({{ payload.filesResolved.list.length }})</div>
      </div>
      <div flex="~ col gap-1" py4 font-mono>
        <FileItem v-for="file of payload.filesResolved.list" :key="file" :filepath="file" />
      </div>
    </div>
  </div>
  <div v-else>
    <div p3 italic op50>
      No matched files found in the workspace.
    </div>
  </div>
</template>
