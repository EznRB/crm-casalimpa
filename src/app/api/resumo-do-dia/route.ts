import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabaseServer'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || todayStr()
    const workDate = new Date(`${date}T00:00:00.000Z`)

    const workRecords = await prisma.employeeWorkRecord.findMany({ where: { workDate } })
    const funcionariosPresentes = workRecords.length
    const custoDiarias = workRecords.reduce((sum: number, r: any) => sum + Number(r.totalAmount || 0), 0)
    const tempoTotalHoras = workRecords.reduce((sum: number, r: any) => sum + Number(r.workDays || 0) * 8, 0)

    const expensesTotalRow: Array<{ total: number }> = await prisma.$queryRaw`
      SELECT COALESCE(SUM(amount),0) AS total
      FROM "cashflow_transactions"
      WHERE "type"='expense' AND "transaction_date"=${date} AND "owner_user_id"=${user.id}
    `
    const totalGastoNoDia = Number((expensesTotalRow[0]?.total || 0))

    const apps: Array<{ id: string; status: string; notes: string | null }> = await prisma.$queryRaw`
      SELECT id, status, notes
      FROM "appointments"
      WHERE "appointment_date"=${date} AND "owner_user_id"=${user.id}
    `
    const statusContagem: Record<string, number> = {}
    const materiaisCount: Record<string, number> = {}
    for (const a of apps) {
      statusContagem[a.status] = (statusContagem[a.status] || 0) + 1
      const n = String(a.notes || '')
      const lines = n.split('\n')
      for (const ln of lines) {
        const s = ln.trim()
        if (s.toLowerCase().startsWith('materiais:')) {
          const rest = s.slice('materiais:'.length).trim()
          const parts = rest.split(',').map((p) => p.trim()).filter(Boolean)
          for (const p of parts) {
            const m = /\s+x(\d+(?:\.\d+)?)$/i.exec(p)
            const nome = m ? p.replace(m[0], '').trim() : p
            const qtd = m ? Number(m[1]) : 1
            materiaisCount[nome] = (materiaisCount[nome] || 0) + qtd
          }
        }
      }
    }
    const materiaisMaisUsados = Object.entries(materiaisCount)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)

    return NextResponse.json({
      date,
      totalGastoNoDia,
      funcionariosPresentes,
      custoDiarias,
      tempoTotalHoras,
      statusObras: statusContagem,
      materiaisMaisUsados,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erro ao resumir dia' }, { status: 400 })
  }
}
