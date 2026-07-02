import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import GlobItem from './GlobItem.vue'

const meta = {
  title: 'Components/GlobItem',
  component: GlobItem,
  tags: ['autodocs'],
} satisfies Meta<typeof GlobItem>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    glob: '**/*.ts',
  },
  play: async ({ canvasElement }) => {
    // The pattern is rendered as highlighted spans, assert on the text content.
    await expect(canvasElement.textContent).toContain('**/*.ts')
  },
}

export const Compound: Story = {
  args: {
    glob: ['**/*.vue', 'app/**'],
  },
  play: async ({ canvasElement }) => {
    // Compound entries join their patterns with an ampersand.
    await expect(within(canvasElement).getByText('&')).toBeInTheDocument()
    await expect(canvasElement.textContent).toContain('app/**')
  },
}

export const ActiveState: Story = {
  args: {
    glob: '**/*.tsx',
    active: true,
  },
}

export const FilesPopup: Story = {
  args: {
    glob: '**/*.ts',
    popup: 'files',
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('button')!)
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText('src/cli.ts')).toBeInTheDocument()
  },
}

export const ConfigsPopup: Story = {
  args: {
    glob: '**/*.ts',
    popup: 'configs',
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('button')!)
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText('typescript')).toBeInTheDocument()
  },
}
