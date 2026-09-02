import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, within } from 'storybook/test'
import StatsBreakdownBar from './StatsBreakdownBar.vue'

const meta = {
  title: 'Components/StatsBreakdownBar',
  component: StatsBreakdownBar,
  tags: ['autodocs'],
} satisfies Meta<typeof StatsBreakdownBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    segments: [
      { label: 'Rules', time: 1108, color: '#8080F2' },
      { label: 'Parse', time: 263, color: '#FDB022' },
      { label: 'Fix', time: 12, color: '#32D583' },
      { label: 'Other', time: 386, color: '#98A2B3' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Rules')).toBeInTheDocument()
    await expect(within(canvasElement).getByText('1.11s')).toBeInTheDocument()
  },
}

export const ZeroSegmentsHidden: Story = {
  args: {
    segments: [
      { label: 'Rules', time: 500, color: '#8080F2' },
      { label: 'Parse', time: 100, color: '#FDB022' },
      { label: 'Fix', time: 0, color: '#32D583' },
      { label: 'Other', time: 0, color: '#98A2B3' },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText('Fix')).not.toBeInTheDocument()
  },
}
