'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import NumberInput from '@/components/form/NumberInput'
import TextInput from '@/components/form/TextInput'
import { captureError, captureMetric, initSentry } from '@/lib/sentry'

type Props = {
  open: boolean
  onClose: () => void
}

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function QuickExpenseModal({ open, onClose }: Props) {
  const [amount, setAmount] = useState<number>(0)
  const [note, setNote] = useState<string>('')
  const focusRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) setTimeout(() => focusRef.current?.focus(), 0)
    initSentry()
  }, [open])

  async function persist() {
    if (Number(amount || 0) <= 0) {
      toast.error('Valor inválido')
      return
    }
    const payload = { type: 'expense', category: 'other', amount: Number(amount), description: note || null, date: todayStr() }
    try {
      const res = await fetch('/api/cashflow/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Falha ao salvar')
      toast.success('Gasto registrado')
      captureMetric('expense_saved', { amount })
      onClose()
    } catch (e) {
      captureError('sync_failure', (e as any)?.message || 'Falha gasto', { payload })
      enqueueOffline(payload)
      toast.success('Gasto enfileirado para salvar offline')
      onClose()
    }
  }

  function enqueueOffline(item: any) {
    try {
      const key = 'offline-cashflow-queue'
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      arr.push(item)
      localStorage.setItem(key, JSON.stringify(arr))
      captureMetric('offline_enqueue', { type: 'expense', amount: item?.amount })
    } catch {}
  }

  useEffect(() => {
    function flush() {
      try {
        const key = 'offline-cashflow-queue'
        const raw = localStorage.getItem(key)
        const arr = raw ? JSON.parse(raw) : []
        if (!Array.isArray(arr) || arr.length === 0) return
        ;(async () => {
          const next: any[] = []
          for (const it of arr) {
            try {
              const url = it?.type === 'expense' ? '/api/cashflow/expense' : '/api/cashflow/income'
              const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(it) })
              if (!res.ok) next.push(it)
            } catch {
              next.push(it)
            }
          }
          localStorage.setItem(key, JSON.stringify(next))
        })()
      } catch {}
    }
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:w-[360px] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-4">
        <div className="text-lg font-semibold mb-3">Registrar Gasto</div>
        <div className="space-y-3">
          <div>
            <NumberInput id="expense-amount" label="Valor" value={amount} onChange={setAmount} placeholder="Valor" step={0.01} min={0} />
          </div>
          <TextInput id="expense-note" label="Nota" value={note} onChange={setNote} placeholder="Nota" inputMode="text" inputRef={focusRef} />
          <div className="flex gap-2 mt-2">
            <button aria-label="Cancelar" onClick={onClose} className="min-h-[44px] h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-700 text-base">Cancelar</button>
            <button aria-label="Salvar" onClick={persist} className="min-h-[44px] h-12 flex-1 rounded-xl bg-primary-600 text-white text-base">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
