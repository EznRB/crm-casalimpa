'use client'

import { useEffect, useState } from 'react'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function ResumoDoDiaPage() {
  const [date, setDate] = useState(todayStr())
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/resumo-do-dia?date=${date}`)
      const d = await res.json()
      setData(d)
    } catch (e) {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [date])

  const statusEntries = Object.entries(data?.statusObras || {})
  const maxStatus = statusEntries.reduce((m, [, v]) => Math.max(m, Number(v || 0)), 0)
  const materiais = (data?.materiaisMaisUsados || []) as Array<{ nome: string; quantidade: number }>
  const maxMat = materiais.reduce((m, v) => Math.max(m, Number(v.quantidade || 0)), 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resumo do Dia</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">KPIs e gráficos simples</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl"
        />
      </div>

      {loading && <div className="text-sm text-gray-500">Carregando…</div>}

      {!loading && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
              <div className="text-sm text-gray-500">Total gasto no dia</div>
              <div className="text-2xl font-bold">R$ {Number(data.totalGastoNoDia || 0).toFixed(2)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
              <div className="text-sm text-gray-500">Funcionários presentes</div>
              <div className="text-2xl font-bold">{Number(data.funcionariosPresentes || 0)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
              <div className="text-sm text-gray-500">Custo total das diárias</div>
              <div className="text-2xl font-bold">R$ {Number(data.custoDiarias || 0).toFixed(2)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
              <div className="text-sm text-gray-500">Tempo total trabalhado</div>
              <div className="text-2xl font-bold">{Number(data.tempoTotalHoras || 0)} h</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
            <div className="text-lg font-semibold mb-3">Status das obras</div>
            <div className="space-y-2">
              {statusEntries.length === 0 && <div className="text-sm text-gray-500">Sem dados</div>}
              {statusEntries.map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-gray-700 dark:text-gray-300">{k}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-xl"
                      style={{ width: `${maxStatus ? (Number(v) / maxStatus) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-10 text-sm text-right">{Number(v || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 shadow p-4">
            <div className="text-lg font-semibold mb-3">Materiais mais usados</div>
            <div className="space-y-2">
              {materiais.length === 0 && <div className="text-sm text-gray-500">Sem dados</div>}
              {materiais.map((m) => (
                <div key={m.nome} className="flex items-center gap-3">
                  <div className="w-40 text-sm text-gray-700 dark:text-gray-300">{m.nome}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-xl"
                      style={{ width: `${maxMat ? (Number(m.quantidade) / maxMat) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="w-10 text-sm text-right">{Number(m.quantidade || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">Atualizado para {date}</div>
        </div>
      )}
    </div>
  )
}

