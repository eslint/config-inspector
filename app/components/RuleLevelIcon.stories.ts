import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import RuleLevelIcon from './RuleLevelIcon.vue'

const meta = {
  title: 'Components/RuleLevelIcon',
  component: RuleLevelIcon,
  tags: ['autodocs'],
} satisfies Meta<typeof RuleLevelIcon>

export default meta
type Story = StoryObj<typeof meta>

export const ErrorLevel: Story = {
  args: {
    level: 'error',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[title="Enabled as \'error\'"]')).not.toBeNull()
  },
}

export const WarnLevel: Story = {
  args: {
    level: 'warn',
  },
}

export const OffLevel: Story = {
  args: {
    level: 'off',
  },
}

export const WithOptions: Story = {
  args: {
    level: 'error',
    hasOptions: true,
    configIndex: 2,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[title="Enabled as \'error\', in the 3rd config item"]')).not.toBeNull()
  },
}

export const WithRedundantOptions: Story = {
  args: {
    level: 'error',
    hasOptions: true,
    hasRedundantOptions: true,
  },
}
