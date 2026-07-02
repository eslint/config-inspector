import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import Shiki from './Shiki'

const meta = {
  title: 'Components/Shiki',
  component: Shiki,
  tags: ['autodocs'],
} satisfies Meta<typeof Shiki>

export default meta
type Story = StoryObj<typeof meta>

export const TypeScript: Story = {
  args: {
    lang: 'ts',
    code: 'const level = {\n  rule: \'no-console\',\n  severity: \'warn\',\n}\nexport default level\n',
  },
  play: async ({ canvasElement }) => {
    // The highlighter is initialized by the preview loader, so the rendered
    // output is real shiki markup rather than the sanitized fallback.
    await expect(canvasElement.querySelector('.shiki')).not.toBeNull()
  },
}

export const JavaScript: Story = {
  args: {
    lang: 'js',
    code: 'module.exports = [\n  { rules: { \'prefer-const\': \'error\' } },\n]\n',
  },
}
