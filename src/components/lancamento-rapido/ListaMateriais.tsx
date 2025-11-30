'use client'

import { useEffect, useState } from 'react'

type MaterialItem = { description: string; qty?: number }
type MaterialsEntry = { appointmentId: string; items: MaterialItem[] }

type Props = { value: MaterialsEntry[]; onChange: (next: MaterialsEntry[]) => void; date: string }

export default function ListaMateriais({ value, onChange, date }: Props) {
  const [jobs, setJobs] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/jobs?from=${date}&to=${date}`)
        const data = await res.json()
        setJobs(data || [])
        if ((data || []).length > 0) setSelected(data[0].id)
      } catch {}
    })()
  }, [date])

  function ensureEntry(appId: string) {
    const entry = value.find((v) => v.appointmentId === appId)
    if (!entry) onChange([...value, { appointmentId: appId, items: [{ description: '' }] }])
  }

  function updateItem(appId: string, idx: number, patch: Partial<MaterialItem>) {
    const next = value.map((v) => {
      if (v.appointmentId !== appId) return v
      const items = [...v.items]
      items[idx] = { ...items[idx], ...patch }
      return { ...v, items }
    })
    onChange(next)
  }

  function addItem(appId: string) {
    const next = value.map((v) => (v.appointmentId === appId ? { ...v, items: [...v.items, { description: '' }] } : v))
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value)
            ensureEntry(e.target.value)
          }}
          className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.customers?.name || j.id}</option>
          ))}
        </select>
        {selected && (
          <button
            onClick={() => addItem(selected)}
            className="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 active:scale-[0.98]"
          >
            Adicionar material
          </button>
        )}
      </div>

      {selected && (
        <div className="space-y-2">
          {(value.find((v) => v.appointmentId === selected)?.items || []).map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <input
                value={item.description}
                onChange={(e) => updateItem(selected, idx, { description: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem(selected)
                }}
                placeholder="Material usado"
                className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
              />
              <input
                type="number"
                step="1"
                value={item.qty || 0}
                onChange={(e) => updateItem(selected, idx, { qty: Number(e.target.value || 0) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem(selected)
                }}
                placeholder="Qtd"
                className="w-24 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
              />
            </div>
          ))}
          {!(value.find((v) => v.appointmentId === selected)?.items || []).length && (
            <button
              onClick={() => addItem(selected)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
            >
              Toque para adicionar material
            </button>
          )}
          {(value.find((v) => v.appointmentId === selected)?.items || []).length > 0 && (
            <button
              onClick={() => addItem(selected)}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
            >
              Toque para adicionar material
            </button>
          )}
        </div>
      )}
    </div>
  )
}
