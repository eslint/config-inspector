import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('lists fixture configs plus ESLint defaults', async ({ page }) => {
  await gotoInspector(page, '/configs')
  // 3 fixture items + 4 internal ESLint defaults = 7 total
  await expect(page.getByTestId('config-item')).toHaveCount(7)
})

test('filters configs by filepath', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await page.getByPlaceholder('Test matching with filepath...').fill('src/sample.ts')

  await expect(page.getByText('Filepath', { exact: true })).toBeVisible()
  await expect(page.getByText(/matched with/)).toBeVisible()
})

test('reports no match for an ignored filepath', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await page.getByPlaceholder('Test matching with filepath...').fill('dist/bundle.js')
  await expect(page.getByText('is not included or has been ignored')).toBeVisible()
})

test('expand all and collapse all toggle config item state', async ({ page }) => {
  await gotoInspector(page, '/configs')

  await page.getByRole('button', { name: 'Collapse All' }).click()
  await expect(page.locator('[data-testid="config-item"][open]')).toHaveCount(0)

  await page.getByRole('button', { name: 'Expand All' }).click()
  const total = await page.getByTestId('config-item').count()
  await expect(page.locator('[data-testid="config-item"][open]')).toHaveCount(total)
})
