import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('appointments')
    .select(`*, customers(name, phone), services(name, duration_minutes)`) as any
  query = query.eq('owner_user_id', user.id)

  if (from && to) {
    query = query.gte('appointment_date', from).lte('appointment_date', to)
  }

  const { data, error } = await query
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('appointments')
    .insert([{ ...body, owner_user_id: user.id }])
    .select(`*, customers(name, phone), services(name, duration_minutes)`) 
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
