'use client'

import TextInput from '@/components/form/TextInput'
import NumberInput from '@/components/form/NumberInput'

type ExpenseEntry = { description: string; amount: number; category?: string }

type Props = { value: ExpenseEntry[]; onChange: (next: ExpenseEntry[]) => void }

export default function ListaGastos({ value, onChange }: Props) {
  function update(i: number, patch: Partial<ExpenseEntry>) {
    const next = [...value]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <button
          onClick={() => onChange([{ description: '', amount: 0 }])}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
        >
          Toque para adicionar gasto
        </button>
      )}
      {value.map((row, i) => (
        <div
          key={i}
          className="flex gap-3 min-h-[44px] p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
          role="button"
          tabIndex={0}
          onClick={() => {
            const el = document.getElementById(`expense-desc-${i}`)
            el?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const el = document.getElementById(`expense-desc-${i}`)
              el?.focus()
            }
          }}
          aria-label={`Editar gasto ${i + 1}`}
        >
          <TextInput
            id={`expense-desc-${i}`}
            value={row.description}
            onChange={(v) => update(i, { description: v })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onChange([...value, { description: '', amount: 0 }])
            }}
            placeholder="Descrição"
            inputMode="text"
            className="flex-1"
          />
          <div className="w-36">
            <NumberInput
              value={row.amount || 0}
              onChange={(v) => update(i, { amount: v })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onChange([...value, { description: '', amount: 0 }])
              }}
              placeholder="Valor"
              step={0.01}
              min={0}
            />
          </div>
        </div>
      ))}
      {value.length > 0 && (
        <button
          onClick={() => onChange([...value, { description: '', amount: 0 }])}
          className="w-full min-h-[44px] h-12 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
          aria-label="Adicionar gasto"
        >
          Toque para adicionar gasto
        </button>
      )}
    </div>
  )
}
