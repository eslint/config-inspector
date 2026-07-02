// @unocss-include
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, within } from 'storybook/test'
import { ref } from 'vue'
import OptionSelectGroup from './OptionSelectGroup.vue'

const meta = {
  title: 'Components/OptionSelectGroup',
  component: OptionSelectGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof OptionSelectGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    options: ['list', 'grid'],
  },
  render: args => ({
    components: { OptionSelectGroup },
    setup() {
      const value = ref<string | number>('list')
      return { args, value }
    },
    template: `
      <div class="flex items-center gap-4">
        <OptionSelectGroup v-model="value" v-bind="args" />
        <span class="font-mono text-sm" data-testid="selected">{{ value }}</span>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('grid'))
    await expect(canvas.getByTestId('selected')).toHaveTextContent('grid')
  },
}

export const WithTitles: Story = {
  args: {
    options: ['configs', 'merged'],
    titles: ['Match by configs', 'Merged view'],
    modelValue: 'configs',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Merged view')).toBeInTheDocument()
  },
}
