import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('employee_work_records')
    .select('*')
    .eq('employeeId', params.id)
    .eq('owner_user_id', user.id)
    .order('workDate', { ascending: false })

  if (error) {
    console.error('Erro ao buscar registros de trabalho:', error)
    return NextResponse.json({ error: 'Erro ao buscar registros de trabalho' }, { status: 500 })
  }
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { workDate, workDays, dailyRate, notes } = body
    const totalAmount = Number(workDays || 0) * Number(dailyRate || 0)

    const { data, error } = await supabase
      .from('employee_work_records')
      .insert([{ employeeId: params.id, workDate, workDays, dailyRate, totalAmount, notes, owner_user_id: user.id }])
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar registro de trabalho:', error)
    return NextResponse.json({ error: 'Erro ao criar registro de trabalho' }, { status: 500 })
  }
}
