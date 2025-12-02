'use client'

type Props = {
  onIncome: () => void
  onExpense: () => void
}

export default function FAB({ onIncome, onExpense }: Props) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      <button
        aria-label="Registrar Renda Hoje"
        onClick={onIncome}
        className="min-h-[44px] h-12 w-44 rounded-full bg-green-600 text-white text-base font-semibold shadow-lg active:scale-[0.98]"
      >
        + Renda
      </button>
      <button
        aria-label="Registrar Gasto Rápido"
        onClick={onExpense}
        className="min-h-[44px] h-12 w-44 rounded-full bg-red-600 text-white text-base font-semibold shadow-lg active:scale-[0.98]"
      >
        + Gasto
      </button>
    </div>
  )
}

