import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  const { user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const body = await request.json()
    const isV1 = typeof body?.employees !== 'undefined'
    const date: string = body.date
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
    const funcionarios = isV1 ? (body.employees || []).map((e: any) => ({ id: String(e.employeeId || e.id), diaria: Number(e.dailyRate || e.diaria || 0), workDays: Number(e.workDays || 1), notes: e.notes || '' })) : (body.funcionarios || []).map((f: any) => ({ id: String(f.id), diaria: Number(f.diaria || 0), workDays: 1, notes: '' }))
    const gastos = isV1 ? (body.expenses || []).map((g: any) => ({ descricao: String(g.description || ''), valor: Number(g.amount || 0), category: String(g.category || 'other') })) : (body.gastos || []).map((g: any) => ({ descricao: String(g.descricao || ''), valor: Number(g.valor || 0), category: 'other' }))
    const materiais = isV1 ? ([] as Array<{ nome: string; quantidade: number }>).concat(...(body.materials || []).map((m: any) => (m.items || []).map((it: any) => ({ nome: String(it.description || ''), quantidade: Number(it.qty || 0) })))) : (body.materiais || []).map((m: any) => ({ nome: String(m.nome || ''), quantidade: Number(m.quantidade || 0) }))
    const obrasStatus = isV1 ? (body.statuses || []).map((s: any) => ({ obraId: String(s.appointmentId || s.obraId), status: String(s.status || '') })) : (body.obrasStatus || []).map((s: any) => ({ obraId: String(s.obraId || ''), status: String(s.status || '') }))
    const observacao: string = isV1 ? String((body.observations || []).map((o: any) => o?.notes).filter(Boolean).join(' | ')) : String(body.observacao || '')

    if (!Array.isArray(funcionarios) || !Array.isArray(gastos) || !Array.isArray(materiais) || !Array.isArray(obrasStatus)) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    for (const f of funcionarios) {
      if (!f.id || f.diaria <= 0 || f.workDays <= 0) return NextResponse.json({ error: 'Funcionários inválidos' }, { status: 400 })
    }
    for (const g of gastos) {
      if (!g.descricao || g.valor <= 0) return NextResponse.json({ error: 'Gastos inválidos' }, { status: 400 })
    }
    for (const m of materiais) {
      if (!m.nome || m.quantidade < 0) return NextResponse.json({ error: 'Materiais inválidos' }, { status: 400 })
    }
    const statusMap: Record<string, string> = { concluido: 'completed', 'em_andamento': 'in_progress', agendado: 'scheduled', confirmado: 'confirmed', cancelado: 'cancelled' }
    for (const s of obrasStatus) {
      if (!s.obraId || !(statusMap[s.status] || ['scheduled','confirmed','in_progress','completed','cancelled'].includes(s.status))) return NextResponse.json({ error: 'Status de obra inválido' }, { status: 400 })
    }

    const workDate = new Date(`${date}T00:00:00.000Z`)
    const result = await prisma.$transaction(async (tx: any) => {
      let funcionariosCount = 0
      for (const f of funcionarios) {
        const existing = await tx.employeeWorkRecord.findFirst({ where: { employeeId: f.id, workDate } })
        const data = {
          employeeId: f.id,
          workDate,
          workDays: Number(f.workDays || 1),
          dailyRate: Number(f.diaria || 0),
          totalAmount: Number(f.diaria || 0) * Number(f.workDays || 1),
          notes: f.notes || null,
          paid: existing?.paid ?? false,
        }
        if (existing) await tx.employeeWorkRecord.update({ where: { id: existing.id }, data })
        else await tx.employeeWorkRecord.create({ data })
        funcionariosCount++
      }

      const obrasAtualizadas: Array<{ obraId: string; status: string }> = []
      const notesSuffix: string[] = []
      if (materiais.length > 0) notesSuffix.push(`Materiais: ${materiais.map((m) => `${m.nome}${m.quantidade ? ` x${m.quantidade}` : ''}`).join(', ')}`)
      if (observacao && observacao.trim()) notesSuffix.push(`Obs dia: ${observacao.trim()}`)
      for (const s of obrasStatus) {
        const id = s.obraId
        const existing = await tx.appointment.findUnique({ where: { id } })
        if (!existing) continue
        const nextStatus = statusMap[s.status] || s.status || existing.status
        const nextNotes = [existing.notes || '', notesSuffix.join(' | ')].filter((x) => x && x.trim().length > 0).join('\n')
        await tx.appointment.update({ where: { id }, data: { status: nextStatus, notes: nextNotes } })
        obrasAtualizadas.push({ obraId: id, status: nextStatus })
      }

      let gastosTotal = 0
      let gastosCount = 0
      for (const g of gastos) {
        await tx.$executeRaw`INSERT INTO "cashflow_transactions" ("type","category","amount","transaction_date","description","owner_user_id") VALUES ('expense', ${g.category || 'other'}, ${g.valor}, ${date}, ${g.descricao}, ${user.id})`
        gastosTotal += Number(g.valor || 0)
        gastosCount++
      }

      return { funcionariosCount, gastosTotal, gastosCount, obrasAtualizadas }
    })

    return NextResponse.json({ date, ...result })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao salvar' }, { status: 400 })
  }
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
    if (!lastDate) return NextResponse.json({ date: null, employees: [], expenses: [], materials: [], statuses: [], observations: [] })

    const wr = await prisma.employeeWorkRecord.findMany({ where: { workDate: new Date(`${lastDate}T00:00:00.000Z`) } })
    const employees = wr.map((r: any) => ({ employeeId: r.employeeId, workDays: Number(r.workDays || 0), dailyRate: Number(r.dailyRate || 0), notes: r.notes || '' }))
    const { data: exps } = await supabase
      .from('cashflow_transactions')
      .select('description, amount, category')
      .eq('type', 'expense')
      .eq('owner_user_id', user.id)
      .eq('transaction_date', lastDate)
    const expenses = (exps || []).map((e: any) => ({ description: e.description, amount: Number(e.amount || 0), category: e.category || 'other' }))
    const { data: jobs } = await supabase
      .from('appointments')
      .select('id, status, notes')
      .eq('owner_user_id', user.id)
      .eq('appointment_date', lastDate)
    const statuses = (jobs || []).map((j: any) => ({ appointmentId: j.id, status: j.status }))
    const materials: Array<{ appointmentId: string; items: Array<{ description: string; qty?: number }> }> = []
    const observations: Array<{ appointmentId: string; notes: string }> = []
    return NextResponse.json({ date: lastDate, employees, expenses, materials, statuses, observations })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao carregar último dia' }, { status: 400 })
  }
}
