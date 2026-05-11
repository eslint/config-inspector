import { expect, test } from '@playwright/test'
import { gotoInspector } from './_helpers'

test('lists used rules from the fixture', async ({ page }) => {
  await gotoInspector(page, '/rules')
  // Fixture uses 2 rules (no-unused-vars, no-console); default filter is 'using'
  await expect(page.getByTestId('rule-item')).toHaveCount(2)
})

test('search narrows rules to a single match', async ({ page }) => {
  await gotoInspector(page, '/rules')
  await expect(page.getByTestId('rule-item')).toHaveCount(2)

  await page.getByPlaceholder('Search rules...').fill('console')
  await expect.poll(async () => page.getByTestId('rule-item').count(), {
    timeout: 5000,
  }).toBe(1)

  await page.getByPlaceholder('Search rules...').fill('')
  await expect.poll(async () => page.getByTestId('rule-item').count()).toBe(2)
})
