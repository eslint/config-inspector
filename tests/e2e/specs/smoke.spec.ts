import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('redirects root to /configs and loads payload without error', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/configs(\?|$)/)
  await expect(page).toHaveTitle(/ESLint Config Inspector/)
  await expect(page.getByText('Failed to load')).toHaveCount(0)
  await expect(page.getByText('Loading config...')).toHaveCount(0)
})

test('shows the inspector badge and nav links', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await expect(page.getByRole('link', { name: /ESLint Config Inspector/ }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Configs' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Rules' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Files' })).toBeVisible()
})

test('header reports composed config count', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await expect(page.getByText(/config items, updated/)).toBeVisible()
})

test('navigates between Configs, Rules, and Files', async ({ page }) => {
  await gotoInspector(page, '/configs')
  await page.getByRole('link', { name: 'Rules' }).click()
  await expect(page).toHaveURL(/\/rules/)
  await page.getByRole('link', { name: 'Files' }).click()
  await expect(page).toHaveURL(/\/files/)
  await page.getByRole('link', { name: 'Configs' }).click()
  await expect(page).toHaveURL(/\/configs/)
})
