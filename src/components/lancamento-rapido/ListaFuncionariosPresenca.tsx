'use client'

import { useEffect, useState } from 'react'

type EmployeeEntry = { employeeId: string; present: boolean; workDays: number; dailyRate: number; notes?: string }

type Props = {
  date: string
  value: EmployeeEntry[]
  onChange: (next: EmployeeEntry[]) => void
}

export default function ListaFuncionariosPresenca({ date, value, onChange }: Props) {
  const [employees, setLocalEmployees] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setLocalEmployees((data || []).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '')))
      } catch {}
    })()
  }, [])

  function togglePresent(empId: string, present: boolean) {
    const exists = value.find((v) => v.employeeId === empId)
    let next = [...value]
    if (present) {
      if (exists) next = next.map((v) => (v.employeeId === empId ? { ...v, present: true } : v))
      else next.push({ employeeId: empId, present: true, workDays: 1, dailyRate: 0 })
    } else {
      next = next.filter((v) => v.employeeId !== empId)
    }
    onChange(next)
  }

  function updateEntry(empId: string, patch: Partial<EmployeeEntry>) {
    const next = value.map((v) => (v.employeeId === empId ? { ...v, ...patch } : v))
    onChange(next)
  }

  function addNextAbsent() {
    const nextAbsent = employees.find((e: any) => !value.find((v) => v.employeeId === e.id))
    if (nextAbsent) togglePresent(nextAbsent.id, true)
  }
  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <button
          onClick={addNextAbsent}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
        >
          Toque para marcar presença
        </button>
      )}
      {employees.map((emp) => {
        const entry = value.find((v) => v.employeeId === emp.id)
        const present = !!entry
        return (
          <div key={emp.id} className="flex items-center gap-2">
            <input type="checkbox" checked={present} onChange={(e) => togglePresent(emp.id, e.target.checked)} />
            <div className="flex-1">{emp.name}</div>
            {present && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.25"
                  value={entry?.workDays ?? 1}
                  onChange={(e) => updateEntry(emp.id, { workDays: Number(e.target.value || 0) })}
                  className="w-24 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
                  placeholder="Dias"
                />
                <input
                  type="number"
                  step="0.01"
                  value={entry?.dailyRate ?? emp.dailyRate ?? 0}
                  onChange={(e) => updateEntry(emp.id, { dailyRate: Number(e.target.value || 0) })}
                  className="w-28 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
                  placeholder="Diária"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const idx = employees.findIndex((x) => x.id === emp.id)
                      const nextEmp = employees[idx + 1]
                      if (nextEmp) togglePresent(nextEmp.id, true)
                    }
                  }}
                />
                <input
                  type="text"
                  value={entry?.notes ?? ''}
                  onChange={(e) => updateEntry(emp.id, { notes: e.target.value })}
                  className="w-56 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
                  placeholder="Obs"
                />
              </div>
            )}
          </div>
        )
      })}
      {value.length > 0 && (
        <button
          onClick={addNextAbsent}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
        >
          Toque para marcar outro presente
        </button>
      )}
    </div>
  )
}
