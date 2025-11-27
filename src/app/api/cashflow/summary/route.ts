import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // formato YYYY-MM
  let startDate: string | undefined
  let nextMonthDate: string | undefined
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1))
    const next = new Date(Date.UTC(y, m, 1))
    startDate = start.toISOString().slice(0, 10)
    nextMonthDate = next.toISOString().slice(0, 10)
  }

  // Base queries
  let txQuery = supabase
    .from('cashflow_transactions')
    .select('id, type, category, amount, transaction_date, client_id') as any

  if (startDate && nextMonthDate) {
    txQuery = txQuery.gte('transaction_date', startDate).lt('transaction_date', nextMonthDate)
  }

  const { data: transactions, error: txError } = await txQuery
  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 400 })
  }

  const totalIncome = (transactions || [])
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
  const totalExpense = (transactions || [])
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
  const net = totalIncome - totalExpense

  // Breakdown por categoria (apenas despesas)
  const expenseByCategory: Record<string, number> = {}
  ;(transactions || [])
    .filter((t: any) => t.type === 'expense')
    .forEach((t: any) => {
      const cat = t.category || 'outros'
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount || 0)
    })

  // Receita por cliente (somente income com client_id)
  let incomeByClient: Array<{ client_id: string; name: string; total: number }> = []
  const clientIds = Array.from(new Set((transactions || [])
    .filter((t: any) => t.type === 'income' && t.client_id)
    .map((t: any) => t.client_id)))

  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from('customers')
      .select('id, name')
      .in('id', clientIds as any)

    const totals: Record<string, number> = {}
    ;(transactions || [])
      .filter((t: any) => t.type === 'income' && t.client_id)
      .forEach((t: any) => {
        const cid = t.client_id as string
        totals[cid] = (totals[cid] || 0) + Number(t.amount || 0)
      })

    incomeByClient = (clients || []).map((c: any) => ({
      client_id: c.id,
      name: c.name,
      total: totals[c.id] || 0,
    }))
    // Ordena por maior total
    incomeByClient.sort((a, b) => b.total - a.total)
  }

  return NextResponse.json({
    month,
    summary: { income: totalIncome, expense: totalExpense, net },
    expenseByCategory,
    incomeByClient,
  })
}
