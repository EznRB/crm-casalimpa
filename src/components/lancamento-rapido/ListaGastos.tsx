'use client'

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
        <div key={i} className="flex gap-3">
          <input
            value={row.description}
            onChange={(e) => update(i, { description: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onChange([...value, { description: '', amount: 0 }])
            }}
            placeholder="Descrição"
            className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
          />
          <input
            type="number"
            step="0.01"
            value={row.amount || 0}
            onChange={(e) => update(i, { amount: Number(e.target.value || 0) })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onChange([...value, { description: '', amount: 0 }])
            }}
            placeholder="Valor"
            className="w-36 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
          />
        </div>
      ))}
      {value.length > 0 && (
        <button
          onClick={() => onChange([...value, { description: '', amount: 0 }])}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
        >
          Toque para adicionar gasto
        </button>
      )}
    </div>
  )
}
