import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const amount: number = Number(body.amount || 0)
  const date: string = (body.date || new Date().toISOString()).slice(0, 10)
  const description: string | null = body.description || null
  const category: string = body.category || 'other'

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cashflow_transactions')
    .insert({
      type: 'income',
      category,
      amount,
      transaction_date: date,
      description,
      owner_user_id: user.id,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
