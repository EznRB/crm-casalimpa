import { parseVoice, normalizeNumberPt } from '../../src/lib/voice'

const employees = [
  { id: 'e1', name: 'João', dailyRate: 150 },
  { id: 'e2', name: 'Maria', dailyRate: 180 },
]

function expectTruthy(x: any) { if (!x) throw new Error('Expected truthy') }
function expectEq(a: any, b: any) { if (a !== b) throw new Error(`Expected ${a} === ${b}`) }

export async function test_parse_funcionario_full() {
  const r = parseVoice('Funcionário João trabalhou diária completa', employees)
  expectTruthy(r.funcionarios.length === 1)
  expectEq(r.funcionarios[0].id, 'e1')
  expectEq(r.funcionarios[0].diaria, 150)
  expectEq(r.funcionarios[0].workDays, 1)
}

export async function test_parse_gasto() {
  const r = parseVoice('Gastei 120 reais com piso', employees)
  expectTruthy(r.gastos.length === 1)
  expectEq(r.gastos[0].descricao, 'piso')
  expectEq(r.gastos[0].valor, 120)
}

export async function test_parse_materiais() {
  const r = parseVoice('Materiais usados: cimento x2, rejunte x3', employees)
  expectTruthy(r.materiais.length === 2)
  expectEq(r.materiais[0].nome, 'cimento')
  expectEq(r.materiais[0].quantidade, 2)
}

export async function test_number_pt() {
  expectEq(normalizeNumberPt('1.234,56'), 1234.56)
}

