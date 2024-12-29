import assert from 'node:assert'
import { matchFile } from '../shared/configs.js'

describe('matchFile', () => {
  describe('global ignored', () => {
    const testGlobalIgnores = (ignores: string[]) => {
      const configs = [{ index: 0, files: ['tests/folder/foo.test.ts'] }, { index: 1, ignores }]
      return matchFile('tests/folder/foo.test.ts', configs, process.cwd())
    }
    it('should match no configs', () => {
      const result = testGlobalIgnores(['tests/**'])
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**'],
        configs: [],
      })
    })

    it('should match when final matched glob is not an unignore', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'])
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should match when irrelevant unignores included', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/other/**', '!tests/*.test.ts'])
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**'],
        configs: [],
      })
    })

    it('should match when file is unignored but directory is ignored', () => {
      const result = testGlobalIgnores(['tests/**', '!tests/**/*.test.ts', 'tests/other/**'])
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should not match when file is unignored and directory is ignored but sub directory is unignored', () => {
      const result = testGlobalIgnores(['tests/**/*', '!tests/**/*/', '!tests/**/*.test.ts', 'tests/other/**'])
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/folder/foo.test.ts', 'tests/**/*', '!tests/**/*.test.ts'],
        configs: [0],
      })
    })
  })

  describe('config matching', () => {
    it('should match a basic config', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: [] }], process.cwd())
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['**'],
        configs: [0],
      })
    })

    it('should be ignored when final matched glob is not an unignore', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'] }], process.cwd())
      assert.deepEqual(result, {
        filepath: 'tests/folder/foo.test.ts',
        globs: ['tests/**', '!tests/folder/**', 'tests/**/*.test.ts'],
        configs: [],
      })
    })

    it('should match when last matching glob is an unignore', () => {
      const result = matchFile('tests/folder/foo.test.ts', [{ index: 0, files: ['**'], ignores: ['tests/**', '!tests/folder/**', 'tests/other/**'] }], process.cwd())
      assert.deepEqual(result, {
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
      assert.deepEqual(result.configs, [0, 3, 4, 7])
    })
  })
})
