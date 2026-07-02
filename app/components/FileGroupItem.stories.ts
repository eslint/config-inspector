import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import FileGroupItem from './FileGroupItem.vue'
import { demoResolved } from './fixtures'

const groups = demoResolved.filesResolved!.groups

const meta = {
  title: 'Components/FileGroupItem',
  component: FileGroupItem,
  tags: ['autodocs'],
} satisfies Meta<typeof FileGroupItem>

export default meta
type Story = StoryObj<typeof meta>

export const VueFiles: Story = {
  args: {
    group: groups.find(group => group.id === '3')!,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('app/app.vue')).toBeInTheDocument()
    await expect(canvas.getByText(/Matched Local Files \(2\)/)).toBeInTheDocument()
  },
}

export const TypeScriptFiles: Story = {
  args: {
    group: groups.find(group => group.id === '2')!,
    index: 1,
  },
}

export const GeneralFiles: Story = {
  args: {
    // Files that only match general configs form an unnamed group.
    group: groups.find(group => group.id === '')!,
    index: 2,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('README.md')).toBeInTheDocument()
  },
}
