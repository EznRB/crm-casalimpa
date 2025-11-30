'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Save, Copy } from 'lucide-react'
import ListaFuncionariosPresenca from '@/components/lancamento-rapido/ListaFuncionariosPresenca'
import ListaGastos from '@/components/lancamento-rapido/ListaGastos'
import ListaMateriais from '@/components/lancamento-rapido/ListaMateriais'
import StatusObras from '@/components/lancamento-rapido/StatusObras'
import SpeechRecordButton from '@/components/lancamento-rapido/SpeechRecordButton'
import { parseVoice, sendVoicePayload, mapStatusPtToEn, normalizeNumberPt } from '@/lib/voice'

type Status = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

type EmployeeEntry = { employeeId: string; present: boolean; workDays: number; dailyRate: number; notes?: string }
type ExpenseEntry = { description: string; amount: number; category?: string }
type MaterialItem = { description: string; qty?: number }
type MaterialsEntry = { appointmentId: string; items: MaterialItem[] }
type StatusEntry = { appointmentId: string; status: Status }
type ObservationEntry = { appointmentId: string; notes: string }

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function LancamentoRapidoPage() {
  const [date, setDate] = useState(todayStr())
  const [employees, setEmployees] = useState<EmployeeEntry[]>([])
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([{ description: '', amount: 0 }])
  const [materials, setMaterials] = useState<MaterialsEntry[]>([])
  const [statuses, setStatuses] = useState<StatusEntry[]>([])
  const [observations, setObservations] = useState<ObservationEntry[]>([])
  const [saving, setSaving] = useState(false)
  const dirtyRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const [allEmployees, setAllEmployees] = useState<Array<{ id: string; name: string; dailyRate?: number }>>([])

  const payload = useMemo(() => ({ date, employees, expenses, materials, statuses, observations }), [date, employees, expenses, materials, statuses, observations])

  useEffect(() => {
    dirtyRef.current = true
  }, [payload])

  useEffect(() => {
    const id = setInterval(() => {
      if (!dirtyRef.current || saving) return
      saveAll()
    }, 1000)
    return () => clearInterval(id)
  }, [saving])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setAllEmployees((data || []).map((e: any) => ({ id: e.id, name: e.name, dailyRate: e.dailyRate })).sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '')))
      } catch {}
    })()
  }, [])

  async function saveAll() {
    setSaving(true)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/lancamento-rapido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortRef.current.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any))
        throw new Error(err?.error || 'Falha ao salvar')
      }
      dirtyRef.current = false
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function duplicateLastDay() {
    try {
      const res = await fetch('/api/lancamento-rapido/duplicar', { method: 'GET' })
      if (!res.ok) throw new Error('Falha ao carregar último dia')
      const data = await res.json()
      if (data?.date) setDate(todayStr())
      if (data?.funcionarios) setEmployees((data.funcionarios || []).map((f: any) => ({ employeeId: f.id, present: true, workDays: 1, dailyRate: Number(f.diaria || 0) })))
      if (data?.gastos) setExpenses((data.gastos || []).map((g: any) => ({ description: g.descricao, amount: Number(g.valor || 0) })))
      if (data?.materiais) setMaterials([{ appointmentId: '', items: (data.materiais || []).map((m: any) => ({ description: m.nome, qty: Number(m.quantidade || 0) })) }])
      if (data?.obrasStatus) setStatuses((data.obrasStatus || []).map((s: any) => ({ appointmentId: s.obraId, status: s.status })))
      if (data?.observacao) setObservations([{ appointmentId: '', notes: data.observacao }])
      dirtyRef.current = true
    } catch (e) {
      console.error(e)
      alert('Não foi possível duplicar o último dia')
    }
  }

  async function handleVoiceText(text: string) {
    const voice = parseVoice(text, allEmployees)
    mergeVoiceIntoState(date, voice, { setEmployees, setExpenses, setMaterials, setStatuses, setObservations })
    try {
      await sendVoicePayload(date, voice)
    } catch (e) {}
    dirtyRef.current = true
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lançamento Rápido</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Registre os dados do dia diretamente pelo celular</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveAll} className="inline-flex items-center rounded-xl bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-sm active:scale-[0.98]">
            <Save className="h-4 w-4 mr-2" />
            Salvar Tudo
          </button>
          <button onClick={duplicateLastDay} className="inline-flex items-center rounded-xl bg-gray-800 px-5 py-3 text-base font-semibold text-white shadow-sm active:scale-[0.98]">
            <Copy className="h-4 w-4 mr-2" />
            Duplicar último dia
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Falar e Registrar</h2>
          </div>
          <SpeechRecordButton
            onTranscript={(text) => handleVoiceText(text)}
            busyLabel={saving ? 'Salvando…' : 'Pronto'}
          />
        </section>
        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Funcionários presentes</h2>
          </div>
          {/* placeholder container for ListaFuncionariosPresenca */}
          <ListaFuncionariosPresenca
            date={date}
            value={employees}
            onChange={setEmployees}
          />
        </section>

        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gastos do dia</h2>
            <button
              onClick={() => setExpenses([...expenses, { description: '', amount: 0 }])}
              className="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </button>
          </div>
          <ListaGastos value={expenses} onChange={setExpenses} />
        </section>

        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Materiais usados</h2>
          </div>
          <ListaMateriais value={materials} onChange={setMaterials} date={date} />
        </section>

        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Status das obras</h2>
          </div>
          <StatusObras value={statuses} onChange={setStatuses} date={date} />
        </section>

        <section className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Observações rápidas</h2>
            <button
              onClick={() => setObservations([...observations, { appointmentId: '', notes: '' }])}
              className="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {observations.map((obs, idx) => (
              <div key={idx} className="flex gap-3">
                <input
                  value={obs.appointmentId}
                  onChange={(e) => {
                    const next = [...observations]
                    next[idx] = { ...obs, appointmentId: e.target.value }
                    setObservations(next)
                  }}
                  placeholder="ID da obra"
                  className="w-44 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
                />
                <input
                  value={obs.notes}
                  onChange={(e) => {
                    const next = [...observations]
                    next[idx] = { ...obs, notes: e.target.value }
                    setObservations(next)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setObservations([...observations, { appointmentId: '', notes: '' }])
                    }
                  }}
                  placeholder="Escreva rapidamente suas observações"
                  className="flex-1 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base"
                />
              </div>
            ))}
            {observations.length === 0 && (
              <button
                onClick={() => setObservations([{ appointmentId: '', notes: '' }])}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-base font-medium active:scale-[0.98]"
              >
                Toque para adicionar observação
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">{saving ? 'Salvando…' : 'Salvamento automático ativado'}</div>
    </div>
  )
}

function mergeVoiceIntoState(date: string, voice: any, setters: { setEmployees: any; setExpenses: any; setMaterials: any; setStatuses: any; setObservations: any }) {
  const { funcionarios, gastos, materiais, obrasStatus, observacao } = voice
  if (funcionarios && funcionarios.length > 0) {
    setters.setEmployees((prev: any[]) => {
      const next = [...prev]
      for (const f of funcionarios) {
        const i = next.findIndex((v) => v.employeeId === f.id)
        const entry = { employeeId: f.id, present: true, workDays: Number(f.workDays || 1), dailyRate: Number(f.diaria || 0) }
        if (i >= 0) next[i] = { ...next[i], ...entry }
        else next.push(entry)
      }
      return next
    })
  }
  if (gastos && gastos.length > 0) {
    setters.setExpenses((prev: any[]) => [...prev, ...gastos.map((g: any) => ({ description: g.descricao, amount: g.valor }))])
  }
  if (materiais && materiais.length > 0) {
    const appointmentId = ''
    setters.setMaterials((prev: any[]) => {
      const next = [...prev]
      if (!next.find((v) => v.appointmentId === appointmentId)) next.push({ appointmentId, items: [] })
      const idx = next.findIndex((v) => v.appointmentId === appointmentId)
      next[idx].items = [...next[idx].items, ...materiais.map((m: any) => ({ description: m.nome, qty: m.quantidade }))]
      return next
    })
  }
  if (obrasStatus && obrasStatus.length > 0) {
    setters.setStatuses((prev: any[]) => {
      const next = [...prev]
      for (const s of obrasStatus) {
        const en = mapStatusPtToEn(String(s.status))
        const i = next.findIndex((v) => v.appointmentId === s.obraId)
        if (i >= 0) next[i] = { appointmentId: s.obraId, status: en }
        else next.push({ appointmentId: s.obraId, status: en })
      }
      return next
    })
  }
  if (observacao && observacao.trim()) {
    setters.setObservations((prev: any[]) => [...prev, { appointmentId: '', notes: observacao }])
  }
}

// sendVoicePayload removido: agora importado de '@/lib/voice'
