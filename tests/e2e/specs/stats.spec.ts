import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('runs the stats analysis and shows slow rules, plugins, and files', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await page.getByRole('link', { name: 'Stats' }).click()
  await expect(page).toHaveURL(/\/stats/)

  await page.getByRole('button', { name: 'Run Stats Analysis' }).click()
  await expect(page.getByText(/Linted \d+ files/)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText('total lint time')).toBeVisible()

  // Rules tab is the default view; a rule row expands to its slowest files
  await expect(page.getByRole('button', { name: 'Slow Rules' })).toBeVisible()
  await page.locator('details > summary').first().click()
  await expect(page.locator('details[open]').first().getByText(/src\/|eslint\.config/).first()).toBeVisible()

  await page.getByRole('button', { name: 'Slow Plugins' }).click()
  await expect(page.getByText('eslint', { exact: true }).first()).toBeVisible()
  // a plugin row expands to its slowest rules
  await page.locator('details > summary').first().click()
  await expect(page.locator('details[open]').first().getByText(/no-|constructor-super|for-direction/).first()).toBeVisible()

  await page.getByRole('button', { name: 'Slow Files' }).click()
  await expect(page.getByText(/src\//).first()).toBeVisible()

  // Tasks tab lists individual rule-on-file entries
  await page.getByRole('button', { name: 'Slow Tasks' }).click()
  await expect(page.getByText(/src\/|eslint\.config/).first()).toBeVisible()
})
