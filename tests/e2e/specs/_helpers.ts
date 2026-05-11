import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Navigate to the inspector and wait until the payload has loaded
 * (NavBar rendered, "Loading config..." gone).
 */
export async function gotoInspector(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await expect(page.getByText('Loading config...')).toHaveCount(0)
  await expect(page.getByText(/Composed with/)).toBeVisible()
}
