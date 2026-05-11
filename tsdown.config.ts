import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/cli.ts',
  ],
  clean: false,
  deps: {
    neverBundle: [
      'devframe',
      /^devframe\//,
    ],
    onlyBundle: [
      'pathe',
      '@nodelib/fs.walk',
      '@nodelib/fs.stat',
      '@nodelib/fs.scandir',
      'queue-microtask',
      'run-parallel',
      'reusify',
      'fastq',
      'yocto-queue',
      'p-limit',
      'p-locate',
      'locate-path',
      'unicorn-magic',
      'find-up',
      'acorn',
      'ufo',
      'mlly',
      '@eslint/config-array',
      'balanced-match',
      'brace-expansion',
      'minimatch',
      'ms',
      'debug',
      'supports-color',
      '@eslint/object-schema',
    ],
  },
  inputOptions: {
    experimental: {
      resolveNewUrlToAsset: false,
    },
  },
})
