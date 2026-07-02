import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { isFetching } from '~/composables/payload'
import NavBar from './NavBar.vue'

const meta = {
  title: 'Components/NavBar',
  component: NavBar,
  tags: ['autodocs'],
} satisfies Meta<typeof NavBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('/demo/project/eslint.config.js')).toBeInTheDocument()
    await expect(canvas.getByText('Configs')).toBeInTheDocument()
    await expect(canvas.getByText('Rules')).toBeInTheDocument()
    await expect(canvas.getByText('Files')).toBeInTheDocument()
    // The demo payload enables one deprecated rule.
    await expect(canvas.getByText('Using 1 deprecated rules')).toBeInTheDocument()
  },
}

export const Fetching: Story = {
  play: async ({ canvasElement }) => {
    isFetching.value = true
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Fetching updates...')).toBeInTheDocument()
  },
}
