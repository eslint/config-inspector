// @unocss-include
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import { demoPayload, demoResolved } from './fixtures'
import RuleItem from './RuleItem.vue'

const meta = {
  title: 'Components/RuleItem',
  component: RuleItem,
  tags: ['autodocs'],
  render: args => ({
    components: { RuleItem },
    setup: () => ({ args }),
    template: args.gridView
      ? `
        <div class="relative border border-base max-w-90 rounded-lg p4 py3 flex flex-col gap-2 of-hidden justify-start">
          <RuleItem v-bind="args" />
        </div>
      `
      : `
        <div class="grid grid-cols-[max-content_max-content_max-content_1fr] items-center gap-x-2 gap-y-2">
          <RuleItem v-bind="args" />
        </div>
      `,
  }),
} satisfies Meta<typeof RuleItem>

export default meta
type Story = StoryObj<typeof meta>

export const ListView: Story = {
  args: {
    rule: demoPayload.rules['prefer-const']!,
    ruleStates: demoResolved.ruleToState.get('prefer-const')!,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('prefer-const')).toBeInTheDocument()
    await expect(canvas.getByText(/Require `const` declarations/)).toBeInTheDocument()
  },
}

export const GridView: Story = {
  args: {
    rule: demoPayload.rules['@typescript-eslint/no-explicit-any']!,
    ruleStates: demoResolved.ruleToState.get('@typescript-eslint/no-explicit-any')!,
    gridView: true,
  },
}

export const Deprecated: Story = {
  args: {
    rule: demoPayload.rules['no-return-await']!,
    ruleStates: demoResolved.ruleToState.get('no-return-await')!,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('DEPRECATED')).toBeInTheDocument()
  },
}
