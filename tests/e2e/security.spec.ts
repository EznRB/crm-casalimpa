import { test, expect } from '@playwright/test'

test('health endpoint responds 200', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(json.status).toBe('ok')
})

test('APIs sem autenticação retornam 401', async ({ request }) => {
  const res1 = await request.get('/api/clients')
  const res2 = await request.get('/api/services')
  const res3 = await request.post('/api/employees', { data: { name: 'Teste', phone: '00000000000', cpf: '00000000000' } })
  expect([res1.status(), res2.status(), res3.status()]).toEqual([401, 401, 401])
})

test('páginas servem cabeçalhos de segurança', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBeLessThan(400)
  const headers = response!.headers()
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('no-referrer')
  expect(headers['content-security-policy']).toBeTruthy()
})
