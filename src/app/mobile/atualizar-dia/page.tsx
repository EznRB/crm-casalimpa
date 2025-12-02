'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { captureError, captureMetric, initSentry } from '@/lib/sentry'
import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/Skeletons'
import MobileCard from '@/components/mobile/MobileCard'
import LargeButton from '@/components/mobile/LargeButton'
import TextInput from '@/components/form/TextInput'
import FAB from '@/components/ui/FAB'
import VoiceCapture from '@/components/voice/VoiceCapture'
const QuickList = dynamic(() => import('@/components/mobile/QuickList'), { ssr: false, loading: () => <SkeletonCard /> })
const ListaGastos = dynamic(() => import('@/components/lancamento-rapido/ListaGastos'), { ssr: false, loading: () => <SkeletonCard /> })
const QuickIncomeModal = dynamic(() => import('@/components/modals/QuickIncomeModal'), { ssr: false })
const QuickExpenseModal = dynamic(() => import('@/components/modals/QuickExpenseModal'), { ssr: false })
const Toaster = dynamic(() => import('sonner').then(m => m.Toaster), { ssr: false })

type EmployeeEntry = { employeeId: string; present: boolean; workDays: number; dailyRate: number; notes?: string }
type ExpenseEntry = { description: string; amount: number }

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function AtualizarDiaMobilePage() {
  const [date, setDate] = useState(todayStr())
  const [employees, setEmployees] = useState<EmployeeEntry[]>([])
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [observation, setObservation] = useState('')
  const [saving, setSaving] = useState(false)
  const dirtyRef = useRef(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const firstFocusRef = useRef<boolean>(true)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

  const payload = useMemo(() => ({
    date,
    employees,
    expenses,
    observations: observation.trim() ? [{ appointmentId: '', notes: observation.trim() }] : []
  }), [date, employees, expenses, observation])

  useEffect(() => {
    if (firstFocusRef.current) {
      firstFocusRef.current = false
    }
    initSentry()
  }, [])

  useEffect(() => {
    dirtyRef.current = true
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (saving) return
      saveAll()
    }, 1000)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [payload])

  function validate(): { ok: boolean; msg?: string } {
    for (const e of employees) {
      if (Number(e.workDays || 0) <= 0) return { ok: false, msg: 'Dias trabalhados deve ser maior que 0' }
      if (Number(e.dailyRate || 0) <= 0) return { ok: false, msg: 'Diária deve ser maior que 0' }
    }
    for (const g of expenses) {
      if (!g.description || !g.description.trim()) return { ok: false, msg: 'Descrição do gasto é obrigatória' }
      if (Number(g.amount || 0) <= 0) return { ok: false, msg: 'Valor do gasto deve ser maior que 0' }
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, msg: 'Data inválida' }
    return { ok: true }
  }

  async function saveAll() {
    const v = validate()
    if (!v.ok) {
      toast.error(v.msg || 'Validação falhou')
      return
    }
    setSaving(true)
    const t0 = performance.now()
    try {
      const res = await fetch('/api/lancamento-rapido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Falha ao salvar')
      }
      dirtyRef.current = false
      toast.success('Salvo')
      const ms = Math.max(0, performance.now() - t0)
      captureMetric('save_time_ms', { ms, employees: employees.length, expenses: expenses.length })
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar')
      captureError('save_failure', e?.message, { employees: employees.length, expenses: expenses.length })
    } finally {
      setSaving(false)
    }
  }

  async function duplicateLastDay() {
    try {
      const res = await fetch('/api/lancamento-rapido/duplicar', { method: 'GET' })
      if (!res.ok) throw new Error('Falha ao carregar último dia')
      const data = await res.json()
      setDate(todayStr())
      if (Array.isArray(data?.funcionarios)) {
        setEmployees((data.funcionarios || []).map((f: any) => ({ employeeId: String(f.id), present: true, workDays: 1, dailyRate: Number(f.diaria || 0) })))
      }
      if (Array.isArray(data?.gastos)) {
        setExpenses((data.gastos || []).map((g: any) => ({ description: String(g.descricao || ''), amount: Number(g.valor || 0) })))
      }
      if (typeof data?.observacao === 'string') {
        setObservation(String(data.observacao || ''))
      }
      dirtyRef.current = true
      toast.success('Último dia duplicado')
    } catch (e: any) {
      toast.error(e?.message || 'Não foi possível duplicar')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Toaster richColors position="top-center" />

      <MobileCard title="Data">
        <div className="flex gap-2">
          <label htmlFor="date" className="sr-only">Data</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-12 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
          />
        </div>
      </MobileCard>

      <div className="space-y-3 mb-4">
        <LargeButton ariaLabel="Salvar Tudo" variant="primary" onClick={saveAll} disabled={saving}>Salvar Tudo</LargeButton>
        <LargeButton ariaLabel="Duplicar Último Dia" variant="secondary" onClick={duplicateLastDay} disabled={saving}>Duplicar Último Dia</LargeButton>
      </div>

      <MobileCard title="Presenças">
        <QuickList value={employees} onChange={setEmployees} autoFocus />
      </MobileCard>

      <MobileCard title="Ditado">
        <VoiceCapture
          onConfirm={(result) => {
            if (Array.isArray(result?.employees)) {
              setEmployees((prev) => {
                const next = [...prev]
                for (const e of result.employees) {
                  const i = next.findIndex((v) => v.employeeId === e.employeeId)
                  if (i >= 0) next[i] = { ...next[i], workDays: 1, dailyRate: e.dailyRate }
                  else next.push({ employeeId: e.employeeId, present: true, workDays: 1, dailyRate: e.dailyRate })
                }
                return next
              })
            }
            if (Array.isArray(result?.expenses)) {
              setExpenses((prev) => [...prev, ...result.expenses.map((g) => ({ description: g.description, amount: g.amount }))])
            }
            const payload = {
              funcionarios: (result?.employees || []).map((e) => ({ id: e.employeeId, diaria: e.dailyRate })),
              gastos: (result?.expenses || []).map((g) => ({ descricao: g.description, valor: g.amount })),
              materiais: [],
              obrasStatus: [],
              observacao: ''
            }
            fetch('/api/lancamento-rapido', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date, ...payload })
            }).then((res) => {
              if (!res.ok) throw new Error('Falha ao salvar ditado')
              toast.success('Ditado salvo')
            }).catch(() => {
              toast.error('Não foi possível salvar agora, mantenho no estado')
            })
          }}
        />
      </MobileCard>

      <MobileCard
        title="Gastos rápidos"
        action={
          <button
            onClick={() => setExpenses([...expenses, { description: '', amount: 0 }])}
            className="inline-flex items-center min-h-[44px] h-12 rounded-xl border border-gray-300 dark:border-gray-600 px-3 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 active:scale-[0.98]"
            aria-label="Adicionar gasto"
          >
            +
          </button>
        }
      >
        <ListaGastos value={expenses} onChange={setExpenses} />
      </MobileCard>

      <MobileCard title="Observação">
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="Observação curta"
          className="w-full min-h-24 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
        />
      </MobileCard>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">{saving ? 'Salvando...' : (dirtyRef.current ? 'Alterações pendentes' : 'Salvo')}</div>
      <FAB onIncome={() => setIncomeOpen(true)} onExpense={() => setExpenseOpen(true)} />
      <QuickIncomeModal open={incomeOpen} onClose={() => setIncomeOpen(false)} />
      <QuickExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </div>
  )
}
