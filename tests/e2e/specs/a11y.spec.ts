import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

type Mode = 'light' | 'dark'

const MODES: Mode[] = ['light', 'dark']
const PAGES = ['/configs', '/rules', '/files'] as const

async function setMode(page: Page, mode: Mode): Promise<void> {
  await page.addInitScript((m) => {
    try {
      localStorage.setItem('vueuse-color-scheme', m)
    }
    catch {}
  }, mode)
}

async function scanContrast(page: Page) {
  return new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .exclude('.shiki')
    .exclude('[data-a11y-skip]')
    .analyze()
}

for (const mode of MODES) {
  for (const path of PAGES) {
    test(`a11y: ${path} has no color-contrast violations in ${mode} mode`, async ({ page }) => {
      await setMode(page, mode)
      await gotoInspector(page, path)

      await expect.poll(async () => {
        return page.evaluate(
          m => document.documentElement.classList.contains('dark') === (m === 'dark'),
          mode,
        )
      }).toBe(true)

      const results = await scanContrast(page)
      const message = JSON.stringify(
        results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.map(n => ({
            target: n.target,
            failureSummary: n.failureSummary,
          })),
        })),
        null,
        2,
      )
      expect.soft(results.violations, message).toEqual([])
    })
  }
}
