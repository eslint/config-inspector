import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import ConfigItem from './ConfigItem.vue'
import { demoPayload } from './fixtures'

const meta = {
  title: 'Components/ConfigItem',
  component: ConfigItem,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfigItem>

export default meta
type Story = StoryObj<typeof meta>

export const ScopedToFiles: Story = {
  args: {
    config: demoPayload.configs[2]!,
    index: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Applies to files matching')).toBeInTheDocument()
    await expect(canvas.getByText('no-explicit-any')).toBeInTheDocument()
  },
}

export const GeneralRules: Story = {
  args: {
    config: demoPayload.configs[1]!,
    index: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Generally applies to all files')).toBeInTheDocument()
  },
}

export const WithPluginsAndOptions: Story = {
  args: {
    config: demoPayload.configs[0]!,
    index: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/Plugins \(2\)/)).toBeInTheDocument()
    await expect(canvas.getByText('Additional configurations')).toBeInTheDocument()
  },
}

export const IgnoresOnly: Story = {
  args: {
    config: demoPayload.configs[4]!,
    index: 4,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Ignore files globally')).toBeInTheDocument()
  },
}

export const Highlighted: Story = {
  args: {
    config: demoPayload.configs[3]!,
    index: 3,
    active: true,
    matchedGlobs: demoPayload.configs[3]!.files as (string | string[])[],
  },
}
