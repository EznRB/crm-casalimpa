import { test, expect } from '@playwright/test'

test('unauthenticated users are redirected to /login', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/login$/)
})
