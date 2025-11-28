import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', params.id)
    .eq('owner_user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Funcionário não encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const cleanCpf = String(body.cpf ?? '').replace(/\D/g, '')
    const payload = { ...body, cpf: cleanCpf }
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', params.id)
      .eq('owner_user_id', user.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar funcionário' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { error } = await supabase.from('employees').delete().eq('id', params.id).eq('owner_user_id', user.id)
  if (error) {
    console.error('Erro ao excluir funcionário:', error)
    return NextResponse.json({ error: 'Erro ao excluir funcionário' }, { status: 500 })
  }
  return NextResponse.json({ message: 'Funcionário excluído com sucesso' })
}
