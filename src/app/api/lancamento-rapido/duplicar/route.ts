import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabaseServer'

function mapStatusToPt(status: string): string {
  const m: Record<string, string> = {
    scheduled: 'agendado',
    confirmed: 'confirmado',
    in_progress: 'em_andamento',
    completed: 'concluido',
    cancelled: 'cancelado',
  }
  return m[status] || status
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const { data: tx } = await supabase
      .from('cashflow_transactions')
      .select('transaction_date')
      .eq('type', 'expense')
      .eq('owner_user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(1)
    let lastDate: string | null = (tx && tx[0]?.transaction_date) || null
    const lastWr = await prisma.employeeWorkRecord.findMany({ orderBy: { workDate: 'desc' }, take: 1 })
    if (lastWr && lastWr[0]?.workDate) {
      const iso = lastWr[0].workDate.toISOString().slice(0, 10)
      lastDate = lastDate && lastDate > iso ? lastDate : iso
    }
    if (!lastDate) {
      return NextResponse.json({ date: null, funcionarios: [], gastos: [], materiais: [], obrasStatus: [], observacao: '' })
    }

    const wr = await prisma.employeeWorkRecord.findMany({ where: { workDate: new Date(`${lastDate}T00:00:00.000Z`) } })
    const funcionarios = wr.map((r) => ({ id: r.employeeId, diaria: Number(r.dailyRate || 0) }))

    const { data: exps } = await supabase
      .from('cashflow_transactions')
      .select('description, amount, category')
      .eq('type', 'expense')
      .eq('owner_user_id', user.id)
      .eq('transaction_date', lastDate)
    const gastos = (exps || []).map((e: any) => ({ descricao: e.description, valor: Number(e.amount || 0) }))

    const { data: jobs } = await supabase
      .from('appointments')
      .select('id, status, notes')
      .eq('owner_user_id', user.id)
      .eq('appointment_date', lastDate)
    const obrasStatus = (jobs || []).map((j: any) => ({ obraId: j.id, status: mapStatusToPt(j.status) }))

    const materiais: Array<{ nome: string; quantidade: number }> = []
    let observacao = ''
    for (const j of jobs || []) {
      const notes = String(j?.notes || '')
      const lines = notes.split('\n')
      for (const ln of lines) {
        const s = ln.trim()
        if (s.toLowerCase().startsWith('materiais:')) {
          const rest = s.slice('materiais:'.length).trim()
          const parts = rest.split(',').map((p) => p.trim()).filter(Boolean)
          for (const p of parts) {
            const m = /\s+x(\d+(?:\.\d+)?)$/i.exec(p)
            if (m) materiais.push({ nome: p.replace(m[0], '').trim(), quantidade: Number(m[1]) })
            else materiais.push({ nome: p, quantidade: 0 })
          }
        } else if (s.toLowerCase().startsWith('obs dia:')) {
          const rest = s.slice('obs dia:'.length).trim()
          observacao = observacao ? `${observacao} | ${rest}` : rest
        }
      }
    }

    return NextResponse.json({ date: lastDate, funcionarios, gastos, materiais, obrasStatus, observacao })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao duplicar' }, { status: 400 })
  }
}

