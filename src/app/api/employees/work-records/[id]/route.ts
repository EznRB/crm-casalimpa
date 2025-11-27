import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  try {
    const body = await request.json()
    const { paid } = body
    const { data, error } = await supabase
      .from('employee_work_records')
      .update({ paid })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error

    // Quando marcar como pago, registrar despesa no fluxo de caixa
    if (paid && data) {
      // buscar nome do funcionário para descrição
      let employeeName: string | null = null
      if ((data as any).employeeId) {
        const { data: emp } = await supabase
          .from('employees')
          .select('name')
          .eq('id', (data as any).employeeId)
          .single()
        employeeName = emp?.name || null
      }

      await supabase
        .from('cashflow_transactions')
        .insert({
          type: 'expense',
          category: 'wages',
          amount: (data as any).totalAmount || 0,
          transaction_date: ((data as any).workDate || new Date().toISOString()).slice(0, 10),
          description: employeeName ? `Pagamento de diária: ${employeeName}` : 'Pagamento de diária'
        })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar registro de trabalho:', error)
    return NextResponse.json({ error: 'Erro ao atualizar registro de trabalho' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { error } = await supabase.from('employee_work_records').delete().eq('id', params.id)
  if (error) {
    console.error('Erro ao excluir registro de trabalho:', error)
    return NextResponse.json({ error: 'Erro ao excluir registro de trabalho' }, { status: 500 })
  }
  return NextResponse.json({ message: 'Registro excluído com sucesso' })
}
