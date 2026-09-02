// @unocss-include
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import StatsBarRow from './StatsBarRow.vue'

const meta = {
  title: 'Components/StatsBarRow',
  component: StatsBarRow,
  tags: ['autodocs'],
  render: args => ({
    components: { StatsBarRow },
    setup: () => ({ args }),
    template: `
      <StatsBarRow v-bind="args">
        <span font-mono>vue/no-child-content</span>
      </StatsBarRow>
    `,
  }),
} satisfies Meta<typeof StatsBarRow>

export default meta
type Story = StoryObj<typeof meta>

export const Slowest: Story = {
  args: {
    time: 424.3,
    max: 424.3,
    total: 1100,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('424.3ms')).toBeInTheDocument()
    await expect(within(canvasElement).getByText('38.6%')).toBeInTheDocument()
  },
}

export const Colored: Story = {
  args: {
    time: 95.9,
    max: 424.3,
    total: 1100,
    color: '#41b883',
  },
}

export const SubMillisecond: Story = {
  args: {
    time: 0.736,
    max: 424.3,
    total: 1100,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('736µs')).toBeInTheDocument()
  },
}
