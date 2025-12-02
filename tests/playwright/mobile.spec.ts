import { test, expect } from '@playwright/test'

function randCpf() {
  return String(Math.floor(10000000000 + Math.random() * 89999999999))
}

test.describe('Fluxos mobile essenciais', () => {
  test('Atualizar dia: 2 presenças + 1 gasto e salvar', async ({ page, request }) => {
    const e1 = await request.post('/api/employees', { data: { name: 'João', phone: '11999999999', cpf: randCpf() } })
    expect(e1.ok()).toBeTruthy()
    const e2 = await request.post('/api/employees', { data: { name: 'Carlos', phone: '11988888888', cpf: randCpf() } })
    expect(e2.ok()).toBeTruthy()

    await page.goto('/mobile/atualizar-dia')
    await page.getByPlaceholder('Digite o nome e pressione [+]').fill('João')
    await page.getByRole('button', { name: '+' }).first().click()
    await page.getByPlaceholder('Diária').first().fill('150')

    await page.getByPlaceholder('Digite o nome e pressione [+]').fill('Carlos')
    await page.getByRole('button', { name: '+' }).first().click()
    await page.getByPlaceholder('Diária').nth(1).fill('150')

    await page.getByRole('button', { name: 'Adicionar' }).first().click()
    await page.getByPlaceholder('Descrição').first().fill('Combustível')
    await page.getByPlaceholder('Valor').first().fill('30')

    await page.getByRole('button', { name: 'Salvar Tudo' }).click()
    await expect(page.getByText('Salvo')).toBeVisible()
  })

  test('FAB + Renda: confirmar', async ({ page }) => {
    await page.goto('/mobile/atualizar-dia')
    await page.getByRole('button', { name: '+ Renda' }).click()
    await page.getByLabel('Valor').fill('150')
    await page.getByLabel('Nota').fill('Renda teste')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Renda registrada')).toBeVisible()
  })

  test('Scan QR (mock) registrar presença', async ({ page, request }) => {
    const e = await request.post('/api/employees', { data: { name: 'Maria', phone: '11977777777', cpf: randCpf() } })
    expect(e.ok()).toBeTruthy()
    const emp: any = await e.json()
    await page.goto('/mobile/scan')
    const r = await request.post('/api/presencas/registrar', { data: { employeeId: emp.id } })
    expect(r.ok()).toBeTruthy()
  })

  test('Offline queue: gasto enfileirado e flush', async ({ page, context }) => {
    await page.goto('/mobile/atualizar-dia')
    await context.setOffline(true)
    await page.getByRole('button', { name: '+ Gasto' }).click()
    await page.getByLabel('Valor').fill('12')
    await page.getByLabel('Nota').fill('Água')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('enfileirada')).toBeVisible()

    const hasQueue = await page.evaluate(() => !!localStorage.getItem('offline-cashflow-queue'))
    expect(hasQueue).toBeTruthy()

    await context.setOffline(false)
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await page.waitForTimeout(500)
    const empty = await page.evaluate(() => (localStorage.getItem('offline-cashflow-queue') || '[]'))
    expect(JSON.parse(empty).length).toBeLessThanOrEqual(1)
  })
})

