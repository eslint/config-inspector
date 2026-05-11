import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('shows matched fixture files in list view', async ({ page }) => {
  await gotoInspector(page, '/files')

  await expect(page.getByText(/Matched Local Files/).first()).toBeVisible()

  await expect(page.getByRole('button', { name: 'src/sample.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'src/sample.test.ts', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'eslint.config.js', exact: true })).toBeVisible()
})

test('toggles between list and group views', async ({ page }) => {
  await gotoInspector(page, '/files')

  // List view: top-level FileItems with file-item data-testid
  const listCount = await page.getByTestId('file-item').count()
  expect(listCount).toBeGreaterThan(0)

  await page.getByRole('button', { name: 'File Groups' }).click()
  await expect(page.getByText('Configs Specific to the Files').first()).toBeVisible()
  await expect(page.getByText('Matched Globs').first()).toBeVisible()

  await page.getByRole('button', { name: 'List' }).click()
  await expect(page.getByTestId('file-item')).toHaveCount(listCount)
})

test('clicking a file navigates to configs page with filter applied', async ({ page }) => {
  await gotoInspector(page, '/files')
  await page.getByRole('button', { name: 'src/sample.test.ts', exact: true }).click()
  await expect(page).toHaveURL(/\/configs/)
  await expect(page.getByPlaceholder('Test matching with filepath...')).toHaveValue('src/sample.test.ts')
})
