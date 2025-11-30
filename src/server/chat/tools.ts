import { NextRequest } from 'next/server'
import { getServerSupabase, getAuthUser } from '@/lib/supabaseServer'

export async function withAuth(request: NextRequest) {
  const { supabase, user } = await getAuthUser(request)
  if (!user) throw new Error('Não autenticado')
  return { supabase, user }
}

export async function fetchKpis(request: NextRequest) {
  const { supabase, user } = await withAuth(request)
  const { data: customers } = await supabase.from('customers').select('id').eq('owner_user_id', user.id) as any
  const { data: appointments } = await supabase.from('appointments').select('id, status, appointment_date, price').eq('owner_user_id', user.id) as any
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyRevenue = (appointments || [])
    .filter((a: any) => a.status === 'completed' && String(a.appointment_date || '').startsWith(currentMonth))
    .reduce((sum: number, a: any) => sum + Number(a.price || 0), 0)
  const pendingAppointments = (appointments || []).filter((a: any) => ['scheduled', 'confirmed'].includes(a.status)).length
  return {
    totalCustomers: (customers || []).length,
    totalAppointments: (appointments || []).length,
    monthlyRevenue,
    pendingAppointments,
  }
}

export async function listAgendaToday(request: NextRequest) {
  const { supabase, user } = await withAuth(request)
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await (supabase
    .from('appointments')
    .select('id, appointment_date, appointment_time, status, customers(name), services(name)')
    .eq('appointment_date', today)
    .eq('owner_user_id', user.id) as any)
  if (error) throw error
  return (data || []).map((a: any) => ({
    id: a.id,
    date: a.appointment_date,
    time: a.appointment_time,
    status: a.status,
    customer: a.customers?.name || '',
    service: a.services?.name || '',
  }))
}

export async function createClient(request: NextRequest, payload: { name: string; phone?: string | null; email?: string | null }) {
  const { supabase, user } = await withAuth(request)
  const base = { name: payload.name, phone: payload.phone || null, email: payload.email || null, owner_user_id: user.id }
  const { data, error } = await supabase.from('customers').insert([base]).select('*').single()
  if (error) throw error
  return data
}

export async function scheduleJob(request: NextRequest, payload: { customer_id: string; service_id: string; date: string; time?: string | null }) {
  const { supabase, user } = await withAuth(request)
  const base = { customer_id: payload.customer_id, service_id: payload.service_id, appointment_date: payload.date, appointment_time: payload.time || null, status: 'scheduled', owner_user_id: user.id }
  const { data, error } = await supabase.from('appointments').insert([base]).select('*').single()
  if (error) throw error
  return data
}

export async function listOverdueInvoices(request: NextRequest) {
  const { supabase, user } = await withAuth(request)
  const today = new Date().toISOString().slice(0, 10)
  const q = supabase
    .from('invoices')
    .select('id, invoice_number, client_id, due_date, status, total, customers(name, email)') as any
  const { data, error } = await q
    .lt('due_date', today)
    .neq('status', 'paid')
    .eq('owner_user_id', user.id)
  if (error) throw error
  return (data || []).map((i: any) => ({ id: i.id, invoice_number: i.invoice_number, client_id: i.client_id, due_date: i.due_date, total: i.total, client_name: i.customers?.name || '', client_email: i.customers?.email || '' }))
}
