import { GLOBALS_UPDATED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'
import { themes } from 'storybook/theming'

// Flip the manager chrome theme on the same `theme` global that drives the
// preview, so the whole UI switches together.
addons.register('theme-sync', (api) => {
  const apply = (theme?: string): void => {
    api.setOptions({ theme: theme === 'dark' ? themes.dark : themes.light })
  }
  apply(api.getGlobals().theme)
  api.getChannel()?.on(GLOBALS_UPDATED, ({ globals }: { globals?: { theme?: string } }) => {
    apply(globals?.theme)
  })
})
