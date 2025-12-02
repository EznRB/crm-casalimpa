"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import TextInput from '@/components/form/TextInput'
import NumberInput from '@/components/form/NumberInput'

type EmployeeEntry = { employeeId: string; present: boolean; workDays: number; dailyRate: number; notes?: string }

type Props = {
  value: EmployeeEntry[]
  onChange: (next: EmployeeEntry[]) => void
  autoFocus?: boolean
}

export default function QuickList({ value, onChange, autoFocus }: Props) {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; dailyRate?: number }>>([])
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setEmployees((data || []).map((e: any) => ({ id: e.id, name: e.name, dailyRate: e.dailyRate })).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase()
    if (!q) return employees.slice(0, 5)
    return employees.filter((e) => (e.name || '').toLowerCase().includes(q)).slice(0, 5)
  }, [input, employees])

  function addByName() {
    setError(null)
    const q = input.trim().toLowerCase()
    if (!q) return
    const found = employees.find((e) => (e.name || '').toLowerCase() === q)
    if (!found) {
      setError('Funcionário não encontrado')
      return
    }
    if (value.find((v) => v.employeeId === found.id)) {
      setError('Já adicionado')
      return
    }
    const entry: EmployeeEntry = { employeeId: found.id, present: true, workDays: 1, dailyRate: Number(found.dailyRate || 0) }
    onChange([...value, entry])
    setInput('')
    inputRef.current?.focus()
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.employeeId !== id))
  }

  function update(id: string, patch: Partial<EmployeeEntry>) {
    onChange(value.map((v) => (v.employeeId === id ? { ...v, ...patch } : v)))
  }

  return (
    <div className="space-y-3">
      {loading && employees.length === 0 && (
        <div className="space-y-2">
          <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      )}
      <div className="flex gap-2">
        <TextInput
          inputRef={inputRef}
          value={input}
          onChange={setInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addByName()
          }}
          placeholder="Digite o nome e pressione [+]"
          inputMode="text"
        />
        <button
          onClick={addByName}
          className="px-4 h-12 rounded-xl bg-gray-800 text-white text-base font-semibold active:scale-[0.98]"
        >
          +
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {input && suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setInput(s.name)
                setError(null)
                inputRef.current?.focus()
              }}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {value.map((v) => {
          const emp = employees.find((e) => e.id === v.employeeId)
          return (
            <div
              key={v.employeeId}
              className="flex items-center gap-2 min-h-[44px] p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
              role="button"
              tabIndex={0}
              onClick={() => {
                const el = document.getElementById(`dailyRate-${v.employeeId}`)
                el?.focus()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const el = document.getElementById(`dailyRate-${v.employeeId}`)
                  el?.focus()
                }
              }}
              aria-label={`Editar ${emp?.name || v.employeeId}`}
            >
              <div className="flex-1 truncate">{emp?.name || v.employeeId}</div>
              <div className="w-24">
                <NumberInput
                  value={v.workDays}
                  onChange={(val) => update(v.employeeId, { workDays: val })}
                  placeholder="Dias"
                  step={0.25}
                  min={0}
                />
              </div>
              <div className="w-28">
                <NumberInput
                  id={`dailyRate-${v.employeeId}`}
                  value={v.dailyRate ?? emp?.dailyRate ?? 0}
                  onChange={(val) => update(v.employeeId, { dailyRate: val })}
                  placeholder="Diária"
                  step={0.01}
                  min={0}
                />
              </div>
              <button aria-label="Remover funcionário" onClick={() => remove(v.employeeId)} className="px-3 min-h-[44px] h-12 rounded-xl bg-red-100 text-red-700 text-base">x</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
