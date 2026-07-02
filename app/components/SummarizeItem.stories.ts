// @unocss-include
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import SummarizeItem from './SummarizeItem.vue'

const meta = {
  title: 'Components/SummarizeItem',
  component: SummarizeItem,
  tags: ['autodocs'],
} satisfies Meta<typeof SummarizeItem>

export default meta
type Story = StoryObj<typeof meta>

export const Rules: Story = {
  args: {
    icon: 'i-ph-list-dashes-duotone',
    number: 42,
    color: 'text-blue5',
    title: 'Rules',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('42')).toBeInTheDocument()
  },
}

export const Files: Story = {
  args: {
    icon: 'i-ph-file-magnifying-glass-duotone',
    number: 3,
    color: 'text-yellow5',
    title: 'Files',
  },
}

export const Empty: Story = {
  args: {
    icon: 'i-ph-plug-duotone',
    number: 0,
    color: 'text-teal5',
    title: 'Plugins',
  },
}
