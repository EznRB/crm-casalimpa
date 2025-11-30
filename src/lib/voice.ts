export type EmployeeMeta = { id: string; name: string; dailyRate?: number }

export function normalizeNumberPt(s: string): number {
  const t = s.replace(/\./g, '').replace(/,/g, '.')
  return Number(t)
}

export function mapStatusPtToEn(s: string): string {
  const m: Record<string, string> = {
    agendado: 'scheduled',
    confirmado: 'confirmed',
    'em andamento': 'in_progress',
    concluido: 'completed',
    cancelado: 'cancelled',
  }
  const k = s.toLowerCase()
  return m[k] || s
}

export function parseVoice(text: string, allEmployees: EmployeeMeta[]) {
  const funcionarios: Array<{ id: string; diaria: number; workDays?: number }> = []
  const gastos: Array<{ descricao: string; valor: number }> = []
  const materiais: Array<{ nome: string; quantidade: number }> = []
  const obrasStatus: Array<{ obraId: string; status: string }> = []
  let observacao = ''

  let m
  m = /funcion[áa]rio\s+([a-zçãáàâêéíóôú\s]+)/i.exec(text)
  if (m) {
    const nome = m[1].trim()
    const emp = allEmployees.find((e) => e.name.toLowerCase().includes(nome.toLowerCase()))
    const half = /(meia\s+di[áa]ria|meio\s+dia)/i.test(text)
    const hours = /([0-9]+)[\s,]*horas?/i.exec(text)
    let workDays = 1
    if (half) workDays = 0.5
    else if (hours) workDays = Math.max(0.125, Math.min(1, Number(hours[1]) / 8))
    const diaria = emp?.dailyRate ? Number(emp.dailyRate) : 0
    if (emp && diaria > 0) funcionarios.push({ id: emp.id, diaria, workDays })
  }

  m = /gastei\s+([0-9.,]+)\s*(reais|r\$)?\s+com\s+(.+)/i.exec(text)
  if (m) {
    const valor = normalizeNumberPt(m[1])
    const descricao = String(m[3]).trim()
    if (valor > 0 && descricao) gastos.push({ descricao, valor })
  }

  m = /materiais?\s+(?:usados?|utilizados?):?\s*(.+)$/i.exec(text)
  if (m) {
    const parts = String(m[1]).split(',').map((p) => p.trim()).filter(Boolean)
    for (const p of parts) {
      const q = /\s+x(\d+(?:\.\d+)?)/i.exec(p)
      if (q) materiais.push({ nome: p.replace(q[0], '').trim(), quantidade: Number(q[1]) })
      else materiais.push({ nome: p, quantidade: 0 })
    }
  }

  m = /status\s+da\s+obra\s+([\w-]+)/i.exec(text)
  if (m) {
    const obraId = m[1]
    const s2 = /(concluido|em andamento|agendado|confirmado|cancelado|completed|in_progress|scheduled|confirmed|cancelled)/i.exec(text)
    const status = s2 ? String(s2[1]).toLowerCase() : ''
    if (obraId && status) obrasStatus.push({ obraId, status })
  }

  if (!funcionarios.length && !gastos.length && !materiais.length && !obrasStatus.length) observacao = text.trim()

  return { funcionarios, gastos, materiais, obrasStatus, observacao }
}

export async function sendVoicePayload(date: string, voice: any) {
  const payload = { date, ...voice }
  const res = await fetch('/api/lancamento-rapido', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Falha ao lançar por voz')
}

