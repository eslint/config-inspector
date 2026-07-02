import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { demoResolved } from './fixtures'
import RuleStateItem from './RuleStateItem.vue'

const meta = {
  title: 'Components/RuleStateItem',
  component: RuleStateItem,
  tags: ['autodocs'],
} satisfies Meta<typeof RuleStateItem>

export default meta
type Story = StoryObj<typeof meta>

export const WithOptions: Story = {
  args: {
    // `prefer-const` is configured with options that match the rule defaults,
    // which also exercises the redundant options highlight.
    state: demoResolved.ruleToState.get('prefer-const')![0]!,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('error')).toBeInTheDocument()
    await expect(canvas.getByText('Rule options')).toBeInTheDocument()
  },
}

export const ScopedToFiles: Story = {
  args: {
    state: demoResolved.ruleToState.get('@typescript-eslint/no-explicit-any')![0]!,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Applies to files matching')).toBeInTheDocument()
  },
}

export const TurnedOff: Story = {
  args: {
    state: demoResolved.ruleToState.get('no-console')!.find(s => s.level === 'off')!,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Turned')).toBeInTheDocument()
  },
}

export const Local: Story = {
  args: {
    state: demoResolved.ruleToState.get('vue/no-v-html')![0]!,
    isLocal: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('in this config')).toBeInTheDocument()
  },
}
