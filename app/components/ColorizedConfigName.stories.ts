import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import ColorizedConfigName from './ColorizedConfigName'

const meta = {
  title: 'Components/ColorizedConfigName',
  component: ColorizedConfigName,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorizedConfigName>

export default meta
type Story = StoryObj<typeof meta>

export const Named: Story = {
  args: {
    name: 'demo/typescript',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('demo')).toBeInTheDocument()
    await expect(canvas.getByText('typescript')).toBeInTheDocument()
  },
}

export const Nested: Story = {
  args: {
    name: 'nuxt > nuxt:setup',
  },
}

export const Anonymous: Story = {
  args: {
    index: 3,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('anonymous')).toBeInTheDocument()
  },
}
