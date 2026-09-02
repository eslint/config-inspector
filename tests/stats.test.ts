import { describe, expect, it } from 'vitest'
import { aggregateStats } from '../src/rpc/run-stats'

function pass(times: { parse?: number, rules?: Record<string, number>, fix?: number, total: number }) {
  return {
    parse: { total: times.parse ?? 0 },
    rules: times.rules
      ? Object.fromEntries(Object.entries(times.rules).map(([name, total]) => [name, { total }]))
      : undefined,
    fix: { total: times.fix ?? 0 },
    total: times.total,
  }
}

describe('aggregateStats', () => {
  it('aggregates rule and file times across results', () => {
    const report = aggregateStats([
      {
        filePath: '/repo/src/a.ts',
        errorCount: 1,
        warningCount: 2,
        stats: {
          times: { passes: [pass({ parse: 2, rules: { 'no-undef': 4, 'vue/attributes-order': 1 }, fix: 0.5, total: 10 })] },
        },
      },
      {
        filePath: '/repo/src/b.ts',
        errorCount: 0,
        warningCount: 0,
        stats: {
          times: {
            passes: [
              pass({ parse: 1, rules: { 'no-undef': 2 }, total: 4 }),
              pass({ parse: 0.5, rules: { 'no-undef': 1 }, total: 2 }),
            ],
          },
        },
      },
      // result without stats (e.g. ignored file) is skipped
      { filePath: '/repo/src/c.ts', errorCount: 3, warningCount: 0 },
    ], '/repo', 123)

    expect(report.totals.total).toBe(16)
    expect(report.totals.parse).toBe(3.5)
    expect(report.totals.rules).toBe(8)
    expect(report.totals.fix).toBe(0.5)
    expect(report.totals.other).toBe(4)

    expect(report.rules).toEqual([
      { name: 'no-undef', time: 7 },
      { name: 'vue/attributes-order', time: 1 },
    ])

    expect(report.files.map(f => f.filepath)).toEqual(['src/a.ts', 'src/b.ts'])
    expect(report.files[1]).toMatchObject({
      filepath: 'src/b.ts',
      total: 6,
      parse: 1.5,
      rules: 3,
      topRules: [{ name: 'no-undef', time: 3 }],
    })

    expect(report.errorCount).toBe(4)
    expect(report.warningCount).toBe(2)
    expect(report.meta.durationMs).toBe(123)
  })

  it('handles empty results', () => {
    const report = aggregateStats([], '/repo', 5)
    expect(report.totals).toEqual({ total: 0, parse: 0, rules: 0, fix: 0, other: 0 })
    expect(report.rules).toEqual([])
    expect(report.files).toEqual([])
  })
})
