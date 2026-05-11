import { describe, expect, it } from 'vitest'
import { matchFile } from '../shared/configs'

describe('matchFile', () => {
  describe('global ignored', () => {
    const testGlobalIgnores = (ignores: string[]) => {
      const configs = [{ index: 0, files: ['tests/folder/foo.test.ts'] }, { index: 1, ignores }]
      return matchFile('tests/folder/foo.test.ts', configs, process.cwd())
    }
    it('should match no configs', () => {
      const result = testGlobalIgnores(['tests/**'])
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**'],
        configs: [],
      })
    })

    it('should match when final matched glob is not an unignore', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'])
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should match when irrelevant unignores included', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/other/**', '!tests/*.test.ts'])
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**'],
        configs: [],
      })
    })

    it('should match when file is unignored but directory is ignored', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/**/*.test.ts', 'tests/other/**'])
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should not match when file is unignored and directory is ignored but sub directory is unignored', () => {
      const result = testGlobalIgnores(['tests/**/*', '!tests/**/*/', '!tests/**/*.test.ts', 'tests/other/**'])
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/folder/foo.test.ts', 'tests/**/*', '!tests/**/*.test.ts'],
        configs: [0],
      })
    })
  })

  describe('config matching', () => {
    it('should match a basic config', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: [] }], process.cwd())
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['**'],
        configs: [0],
      })
    })

    it('should be ignored when final matched glob is not an unignore', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'] }], process.cwd())
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should match when last matching glob is an unignore', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: ['tests/**', '!tests/folder/**', 'tests/other/**'] }], process.cwd())
      expect(result).toEqual({
        filepath: 'tests/folder/foo.test.ts',
        globs: ['**', 'tests/**', '!tests/folder/**'],
        configs: [0],
      })
    })

    it ('should match multiple configs / a complex case', () => {
      const result = matchFile('tests/folder/foo.test.ts', [
        { index: 0, files: ['**'], ignores: [] },
        { index: 1, files: ['**/*.miss.ts'], ignores: ['tests/**'] },
        { index: 2, files: ['**/*.miss.ts'], ignores: [] },
        { index: 3, files: ['**'], ignores: ['tests/**', '!**/*.ts'] },
        { index: 4, files: ['**'], ignores: ['tests/**.miss'] },
        { index: 5, files: ['**'], ignores: ['tests/**', '!tests/folder/*.foo', '!tests/folder/*.bar'] },
        { index: 6, files: ['**'], ignores: ['tests/**', '!tests/*.test.ts', 'tests/folder/*'] },
        { index: 7, files: ['**'], ignores: ['tests/**', '!tests/*.test.ts', 'tests/folder/*', '!tests/folder/*.ts', 'tests/other/**'] },
      ], process.cwd())
      expect(result.configs).toEqual([0, 3, 4, 7])
    })
  })

  describe('compound globs (AND)', () => {
    it('should not match when intersection is empty (issue #190)', () => {
      // mirrors `defineConfig({ files: ['root.js'], extends: [{ files: ['subdir/*.js'], ... }] })`
      const result = matchFile('root.js', [
        { index: 0, files: [['root.js', 'subdir/*.js']], rules: { 'no-unused-vars': 'off' } },
        { index: 1, files: ['root.js'] },
      ], process.cwd())
      expect(result.configs).toEqual([1])
    })

    it('should not match when one inner pattern fails', () => {
      const result = matchFile('src/a.ts', [
        { index: 0, files: [['src/**', '*.js']] },
      ], process.cwd())
      expect(result.configs).toEqual([])
    })

    it('should match when every inner pattern matches', () => {
      const result = matchFile('src/a.ts', [
        { index: 0, files: [['src/**', '**/*.ts']] },
      ], process.cwd())
      expect(result.configs).toEqual([0])
      expect(result.globs).toEqual([['src/**', '**/*.ts']])
    })

    it('should mix single and compound entries (OR over outer, AND over inner)', () => {
      const configs = [
        { index: 0, files: ['a.js', ['b.js', '**/*.ts']] },
      ]
      const a = matchFile('a.js', configs, process.cwd())
      expect(a.configs).toEqual([0])
      expect(a.globs).toEqual(['a.js'])

      const b = matchFile('b.ts', configs, process.cwd())
      // 'b.ts' matches the compound ['b.js', '**/*.ts']? No — 'b.ts' doesn't match 'b.js'.
      expect(b.configs).toEqual([])

      const c = matchFile('b.js', configs, process.cwd())
      // 'b.js' matches 'b.js' but not '**/*.ts'.
      expect(c.configs).toEqual([])
    })

    it('should match a compound where every pattern fits', () => {
      const result = matchFile('src/foo.ts', [
        { index: 0, files: ['a.js', ['src/**', '**/*.ts']] },
      ], process.cwd())
      expect(result.configs).toEqual([0])
      expect(result.globs).toEqual([['src/**', '**/*.ts']])
    })
  })
})
