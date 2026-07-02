<script setup lang="ts">
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
  <fieldset class="text-sm inline-flex flex-wrap gap-1 of-hidden">
    <label
      v-for="i, idx of options" :key="i"
      class="px2.5 py0.5 border border-base rounded-full relative hover:bg-hover"
      :class="[
        i === value ? 'bg-active border-active' : 'saturate-0 hover:saturate-100',
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
        class="op-0.1 inset-0 absolute"
      >
    </label>
  </fieldset>
</template>
