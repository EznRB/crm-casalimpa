import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const employeeId: string = String(body.employeeId || '').trim()
    const workDate: string = (body.workDate || new Date().toISOString()).slice(0, 10)
    const workDays: number = Number(body.workDays || 1)
    if (!employeeId) return NextResponse.json({ error: 'Funcionário inválido' }, { status: 400 })
    if (workDays <= 0) return NextResponse.json({ error: 'Dias inválidos' }, { status: 400 })

    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('id, dailyRate')
      .eq('id', employeeId)
      .eq('owner_user_id', user.id)
      .single()
    if (empErr || !emp) return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })

    const dailyRate = Number((body.dailyRate ?? emp.dailyRate) || 0)
    const totalAmount = dailyRate * workDays

    const { data, error } = await supabase
      .from('employee_work_records')
      .insert([{ employeeId, workDate, workDays, dailyRate, totalAmount, owner_user_id: user.id }])
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro ao registrar presença' }, { status: 400 })
  }
}

