export type EmployeeMeta = { id: string; name: string; dailyRate?: number }

export function normalizePtNumber(s: string): number {
  const t = s.replace(/\./g, '').replace(/,/g, '.')
  return Number(t)
}

export function parseTranscript(text: string, employees: EmployeeMeta[]) {
  const employeesOut: Array<{ employeeId: string; workDays: number; dailyRate: number }> = []
  const expensesOut: Array<{ description: string; amount: number; category?: string }> = []

  const parts = text.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean)
  for (const p of parts) {
    const mNum = /([0-9]+(?:[.,][0-9]+)?)/.exec(p)
    if (!mNum) continue
    const n = normalizePtNumber(mNum[1])
    const left = p.replace(mNum[0], '').trim()
    if (!left) continue
    const words = left.toLowerCase().split(/\s+/).filter(Boolean)
    const nameMatch = employees.find((e) => left.toLowerCase().includes(String(e.name || '').toLowerCase()))
    if (nameMatch) {
      const diaria = n
      if (diaria > 0) employeesOut.push({ employeeId: nameMatch.id, workDays: 1, dailyRate: diaria })
      continue
    }
    const cat = words[0]
    if (n > 0) expensesOut.push({ description: left, amount: n, category: cat })
  }

  return { employees: employeesOut, expenses: expensesOut }
}

