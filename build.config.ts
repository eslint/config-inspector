import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/cli.ts',
  ],
  clean: false,
  // TODO: remove this when https://github.com/egoist/bundle-require/pull/41 is merged
  rollup: {
    inlineDependencies: true,
  },
})
