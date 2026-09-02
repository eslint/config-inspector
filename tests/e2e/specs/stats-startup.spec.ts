import { expect, test } from '@playwright/test'
import { STATS_BASE_URL } from '../../../playwright.config'

// Runs against the dedicated dev server started with `--stats`, which
// kicks off the analysis at startup so the stats page shows the result
// without a manual run.
test('--stats runs the analysis on startup and shows results directly', async ({ page }) => {
  await page.goto(`${STATS_BASE_URL}/stats`)

  await expect(page.getByText(/Linted \d+ files/)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText('total lint time')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Run Stats Analysis' })).toHaveCount(0)
})
