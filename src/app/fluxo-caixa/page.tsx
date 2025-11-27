'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCashflowSummary, createCashflowExpense } from '@/lib/db'
import { BarChart3, DollarSign, TrendingDown, TrendingUp, Calendar as CalendarIcon, Users } from 'lucide-react'

interface SummaryResponse {
  month: string | null
  summary: { income: number; expense: number; net: number }
  expenseByCategory: Record<string, number>
  incomeByClient: Array<{ client_id: string; name: string; total: number }>
}

export default function CashflowPage() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ category: 'products', amount: '', date: new Date().toISOString().slice(0,10), description: '' })
  const [savingExpense, setSavingExpense] = useState(false)

  useEffect(() => {
    fetchData()
  }, [month])

  const fetchData = async () => {
    setLoading(true)
    try {
      const summary = await getCashflowSummary(month)
      setData(summary)
    } finally {
      setLoading(false)
    }
  }

  const saveExpense = async () => {
    setSavingExpense(true)
    try {
      await createCashflowExpense({
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description,
      })
      await fetchData()
      setExpenseForm({ category: 'products', amount: '', date: new Date().toISOString().slice(0,10), description: '' })
    } finally {
      setSavingExpense(false)
    }
  }

  const expenseCategories = useMemo(() => {
    const entries = Object.entries(data?.expenseByCategory || {})
    const total = entries.reduce((s, [, v]) => s + v, 0)
    return entries.map(([k, v]) => ({ key: k, value: v, pct: total ? (v / total) * 100 : 0 }))
  }, [data])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Fluxo de Caixa</h1>
        <p className="text-gray-600 dark:text-gray-400">Acompanhe receitas, despesas e resultado mensal</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Mês
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Registrar Despesa</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Categoria</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  <option value="products">Produtos</option>
                  <option value="transport">Transporte/Gasolina</option>
                  <option value="wages">Diária de Funcionários</option>
                  <option value="other">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Data</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Descrição</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={saveExpense}
                disabled={savingExpense || !expenseForm.amount}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingExpense ? 'Salvando...' : 'Salvar Despesa'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">R$ {(data?.summary.income || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">R$ {(data?.summary.expense || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resultado</p>
                  <p className={`text-2xl font-semibold ${((data?.summary.net || 0) >= 0) ? 'text-green-700' : 'text-red-700'}`}>R$ {(data?.summary.net || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Despesas por Categoria</h3>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="p-6 space-y-4">
                {expenseCategories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Sem despesas registradas neste mês</p>
                ) : (
                  expenseCategories.map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">{item.key}</span>
                        <span>R$ {item.value.toLocaleString('pt-BR')} ({item.pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                        <div
                          className="h-2 bg-purple-600 rounded"
                          style={{ width: `${Math.min(100, item.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Receita por Cliente</h3>
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="p-6 space-y-3">
                {((data?.incomeByClient || []).length) === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Sem recebimentos por cliente neste mês</p>
                ) : (
                  (data?.incomeByClient || []).slice(0, 8).map((c) => (
                    <div key={c.client_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-sm">R$ {c.total.toLocaleString('pt-BR')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
