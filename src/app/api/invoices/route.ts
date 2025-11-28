import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('invoices')
    .select(`*, appointments(id, appointment_date, customers(name), services(name))`)
    .eq('owner_user_id', user.id)
    .order('issue_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { appointmentId, subtotal, tax } = await request.json()
  const invoiceNumber = `INV-${Date.now()}`
  const subtotalValue = typeof subtotal === 'number' ? subtotal : 0
  const taxValue = typeof tax === 'number' ? tax : 0
  const total = subtotalValue + taxValue

  const { data, error } = await supabase
    .from('invoices')
    .insert([{ appointment_id: appointmentId, invoice_number: invoiceNumber, subtotal: subtotalValue, tax: taxValue, total, owner_user_id: user.id }])
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
