import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { version } from '~~/package.json'
import ConfigInspectorBadge from './ConfigInspectorBadge.vue'

const meta = {
  title: 'Components/ConfigInspectorBadge',
  component: ConfigInspectorBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfigInspectorBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('ESLint Config Inspector')).toBeInTheDocument()
    await expect(canvas.getByText(`v${version}`)).toBeInTheDocument()
  },
}

export const WithoutVersion: Story = {
  args: {
    showVersion: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByText(`v${version}`)).not.toBeInTheDocument()
  },
}
