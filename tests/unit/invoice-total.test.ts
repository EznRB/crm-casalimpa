import test from 'node:test'
import assert from 'node:assert'

function calculateTotal(subtotal: number, tax: number) {
  return subtotal + tax
}

test('calcula total da fatura somando subtotal e taxa', () => {
  assert.strictEqual(calculateTotal(100, 0), 100)
  assert.strictEqual(calculateTotal(100, 10), 110)
  assert.strictEqual(calculateTotal(0, 0), 0)
})