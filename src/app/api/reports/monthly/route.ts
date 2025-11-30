import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')

  let jobsQuery = supabase
    .from('appointments')
    .select('id, appointment_date, status, price') as any
  jobsQuery = jobsQuery.eq('owner_user_id', user.id)
  let invoicesQuery = supabase
    .from('invoices')
    .select('id, issue_date, status, total') as any
  invoicesQuery = invoicesQuery.eq('owner_user_id', user.id)

  if (month) {
    jobsQuery = jobsQuery.like('appointment_date', `${month}%`)
    invoicesQuery = invoicesQuery.like('issue_date', `${month}%`)
  }

  const [{ data: jobs, error: jobsError }, { data: invoices, error: invError }] = await Promise.all([
    jobsQuery,
    invoicesQuery,
  ])

  if (jobsError || invError) {
    const message = jobsError?.message || invError?.message || 'Erro ao gerar relatório'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const totalJobs = jobs?.length ?? 0
  const doneJobs = jobs?.filter((j: any) => j.status === 'completed').length ?? 0
  const cancelledJobs = jobs?.filter((j: any) => j.status === 'cancelled').length ?? 0
  const jobsRevenue = jobs?.reduce((sum: number, j: any) => sum + Number(j.price || 0), 0) ?? 0

  const totalInvoices = invoices?.length ?? 0
  const paidInvoices = invoices?.filter((i: any) => i.status === 'paid').length ?? 0
  const invoicesRevenue = invoices?.reduce((sum: number, i: any) => sum + Number(i.total || 0), 0) ?? 0

  return NextResponse.json({
    month,
    jobs: { total: totalJobs, done: doneJobs, cancelled: cancelledJobs, revenue: jobsRevenue },
    invoices: { total: totalInvoices, paid: paidInvoices, revenue: invoicesRevenue },
    totals: { revenue: invoicesRevenue },
  })
}
