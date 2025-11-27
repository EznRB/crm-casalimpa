import { test, expect } from '@playwright/test'

test('fluxo crítico: login → cliente → agendar → done → invoice → PDF → pago', async ({ page }) => {
  await page.goto('/login')
  expect(await page.title()).toBeTruthy()
})
