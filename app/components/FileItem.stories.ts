import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { filtersConfigs } from '~/composables/state'
import FileItem from './FileItem.vue'

const meta = {
  title: 'Components/FileItem',
  component: FileItem,
  tags: ['autodocs'],
} satisfies Meta<typeof FileItem>

export default meta
type Story = StoryObj<typeof meta>

export const VueFile: Story = {
  args: {
    filepath: 'app/components/NavBar.vue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('app/components/NavBar.vue'))
    // Clicking pushes the file into the configs page filter.
    await expect(filtersConfigs.filepath).toBe('app/components/NavBar.vue')
  },
}

export const TypeScriptFile: Story = {
  args: {
    filepath: 'src/cli.ts',
  },
}

export const MarkdownFile: Story = {
  args: {
    filepath: 'README.md',
  },
}
