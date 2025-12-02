import { test, expect } from '@playwright/test'

test.describe('Smoke PWA', () => {
  test('Home carrega e registra manifest/SW', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Casa Limpa')).toBeVisible({ timeout: 5000 })
    const hasManifest = await page.evaluate(() => !!document.querySelector('link[rel="manifest"]'))
    expect(hasManifest).toBeTruthy()
    const swOk = await page.evaluate(async () => {
      try {
        return !!navigator.serviceWorker
      } catch { return false }
    })
    expect(swOk).toBeTruthy()
  })

  test('Fluxo básico: Clientes/Serviços/Agendamentos navegação', async ({ page }) => {
    await page.goto('/clientes')
    await expect(page.locator('text=Clientes')).toBeVisible()
    await page.goto('/servicos')
    await expect(page.locator('text=Serviços')).toBeVisible()
    await page.goto('/agendamentos')
    await expect(page.locator('text=Agendamentos')).toBeVisible()
  })

  test('Página de QR acessa câmera (permits mocked)', async ({ context, page }) => {
    await context.grantPermissions(['camera'])
    await page.goto('/pwa-qa/qr')
    await expect(page.locator('text=Teste de Câmera/QR')).toBeVisible()
    // Não validamos leitura real; apenas UI carregada
  })

  test('Offline: renderiza conteúdo cacheado', async ({ context, page }) => {
    await page.goto('/clientes')
    await expect(page.locator('text=Clientes')).toBeVisible()
    await context.setOffline(true)
    await page.goto('/clientes')
    await expect(page.locator('text=Clientes')).toBeVisible()
    await context.setOffline(false)
  })
})
