import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('invoices')
    .select(`*, appointments(*, customers(name), services(name))`)
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const updateData: any = {}
  if (body.status) updateData.status = body.status

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Se fatura foi marcada como paga, registrar no fluxo de caixa
  if (updateData.status === 'paid') {
    const { data: inv } = await supabase
      .from('invoices')
      .select('id, total, issue_date, appointment_id')
      .eq('id', params.id)
      .eq('owner_user_id', user.id)
      .single()

    let clientId: string | null = null
    if (inv?.appointment_id) {
      const { data: appt } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('id', inv.appointment_id)
        .eq('owner_user_id', user.id)
        .single()
      clientId = appt?.customer_id || null
    }

    await supabase
      .from('cashflow_transactions')
      .insert({
        type: 'income',
        category: 'client_payment',
        amount: inv?.total || 0,
        transaction_date: new Date().toISOString().slice(0, 10),
        client_id: clientId,
        invoice_id: inv?.id || null,
        description: 'Recebimento de fatura',
        owner_user_id: user.id
      })
  }
  return NextResponse.json(data)
}
