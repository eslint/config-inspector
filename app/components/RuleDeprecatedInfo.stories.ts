import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { demoPayload } from './fixtures'
import RuleDeprecatedInfo from './RuleDeprecatedInfo.vue'

const meta = {
  title: 'Components/RuleDeprecatedInfo',
  component: RuleDeprecatedInfo,
  tags: ['autodocs'],
} satisfies Meta<typeof RuleDeprecatedInfo>

export default meta
type Story = StoryObj<typeof meta>

export const Deprecated: Story = {
  args: {
    deprecated: demoPayload.rules['no-return-await']!.deprecated,
    invalid: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('DEPRECATED'))
    const body = within(canvasElement.ownerDocument.body)
    await expect(await body.findByText(/was deprecated in v8\.46\.0/)).toBeInTheDocument()
  },
}

export const Invalid: Story = {
  args: {
    deprecated: true,
    invalid: true,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('INVALID')).toBeInTheDocument()
  },
}
