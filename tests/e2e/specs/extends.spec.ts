import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { EXTENDS_BASE_URL } from '../../../playwright.config'

async function gotoExtends(page: Page, path: string) {
  await page.goto(`${EXTENDS_BASE_URL}${path}`)
  await expect(page.getByText('Loading config...')).toHaveCount(0)
  await expect(page.getByText(/Composed with/)).toBeVisible()
}

test('renders a compound (AND) glob as a single badge with `&` separator', async ({ page }) => {
  await gotoExtends(page, '/configs')

  // The config produced by `defineConfig` for the extended item has
  // files: [['root.js', 'subdir/*.js']] — a single compound (AND) entry.
  // It must render as one badge with both patterns joined by `&`, not as
  // two independent badges (which would falsely imply OR).
  const extendedConfig = page
    .getByTestId('config-item')
    .filter({ hasText: 'ExtendedConfig' })
    .first()

  await expect(extendedConfig).toBeVisible()

  const filesRow = extendedConfig
    .locator('text=Applies to files matching')
    .locator('xpath=..')

  const filesText = (await filesRow.textContent()) ?? ''
  expect(filesText).toContain('root.js')
  expect(filesText).toContain('subdir/*.js')
  expect(filesText).toContain('&')
})
