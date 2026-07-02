import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import ColorizedRuleName from './ColorizedRuleName.vue'

const meta = {
  title: 'Components/ColorizedRuleName',
  component: ColorizedRuleName,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorizedRuleName>

export default meta
type Story = StoryObj<typeof meta>

export const PluginRule: Story = {
  args: {
    name: 'vue/no-v-html',
    prefix: 'vue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('vue')).toBeInTheDocument()
    await expect(canvas.getByText('no-v-html')).toBeInTheDocument()
  },
}

export const CoreRule: Story = {
  args: {
    name: 'prefer-const',
  },
}

export const Deprecated: Story = {
  args: {
    name: 'no-return-await',
    deprecated: true,
  },
}

export const Borderless: Story = {
  args: {
    name: '@typescript-eslint/no-explicit-any',
    prefix: '@typescript-eslint',
    borderless: true,
  },
}
