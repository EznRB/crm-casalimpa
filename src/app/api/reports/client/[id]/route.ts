import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

function toCSV(headers: string[], rows: any[]) {
  const head = headers.join(',')
  const body = rows
    .map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
    .join('\n')
  return `${head}\n${body}`
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')

  let query = supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, status, price, service_id, services(name)')
    .eq('customer_id', params.id) as any

  if (month) {
    query = query.like('appointment_date', `${month}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const rows = (data ?? []).map((d: any) => ({
    id: d.id,
    date: d.appointment_date,
    appointment_time: d.appointment_time,
    service: d.services?.name ?? '',
    status: d.status,
    total: `R$ ${Number(d.price).toFixed(2)}`,
  }))
  const csv = toCSV(['id', 'date', 'appointment_time', 'service', 'status', 'total'], rows)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio-cliente-${params.id}.csv"`,
    },
  })
}
