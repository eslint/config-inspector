import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('runs the stats analysis and shows slow rules, plugins, and files', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await page.getByRole('link', { name: 'Stats' }).click()
  await expect(page).toHaveURL(/\/stats/)

  await page.getByRole('button', { name: 'Run Stats Analysis' }).click()
  await expect(page.getByText(/Linted \d+ files/)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText('total lint time')).toBeVisible()

  // Rules tab is the default view
  await expect(page.getByRole('button', { name: 'Slow Rules' })).toBeVisible()

  await page.getByRole('button', { name: 'Slow Plugins' }).click()
  await expect(page.getByText('eslint', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Slow Files' }).click()
  await expect(page.getByText(/src\//).first()).toBeVisible()
})
