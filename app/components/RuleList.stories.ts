import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { demoPayload } from './fixtures'
import RuleList from './RuleList.vue'

const meta = {
  title: 'Components/RuleList',
  component: RuleList,
  tags: ['autodocs'],
} satisfies Meta<typeof RuleList>

export default meta
type Story = StoryObj<typeof meta>

export const FromConfig: Story = {
  args: {
    // Record form, as used inside a config item: values carry the levels.
    rules: demoPayload.configs[1]!.rules!,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('prefer-const')).toBeInTheDocument()
    await expect(canvas.getByText('no-console')).toBeInTheDocument()
  },
}

export const AllRules: Story = {
  args: {
    // Array form, as used on the rules page: states come from the payload.
    rules: Object.values(demoPayload.rules),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('no-v-html')).toBeInTheDocument()
  },
}

export const Filtered: Story = {
  args: {
    rules: Object.values(demoPayload.rules),
    filter: (name: string) => name.startsWith('no-'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('no-console')).toBeInTheDocument()
    await expect(canvas.queryByText('prefer-const')).not.toBeInTheDocument()
  },
}
