<script setup lang="ts">
import { defineModel } from 'vue'

defineProps<{
  options: readonly string[] | number[]
  titles?: string[]
  classes?: string[]
  props?: any[]
}>()

const value = defineModel<string | number>('modelValue', {
  type: [String, Number],
})
</script>

<template>
  <fieldset flex="~ inline gap-1 wrap" of-hidden text-sm>
    <label
      v-for="i, idx of options" :key="i"
      border="~ base rounded-full" relative hover:bg-hover px2.5 py0.5
      :class="[
        i === value ? 'bg-active' : 'saturate-0 hover:saturate-100',
        props?.[idx]?.class || '',
      ]"
      v-bind="props?.[idx]"
      :title="titles?.[idx]"
    >
      <div
        :class="[
          i === value ? '' : 'op50',
          titles?.[idx] ? '' : 'capitalize',
          classes?.[idx] || '',
        ]"
      >
        <slot :value="i" :title="titles?.[idx]" :index="idx">
          {{ titles?.[idx] ?? i }}
        </slot>
      </div>
      <input
        v-model="value" type="radio" :value="i"
        :title="titles?.[idx]"
        absolute inset-0 op-0.1
      >
    </label>
  </fieldset>
</template>
