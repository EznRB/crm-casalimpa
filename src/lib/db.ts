import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type CustomerRow = Database['public']['Tables']['customers']['Row']
type ServiceRow = Database['public']['Tables']['services']['Row']
type AppointmentRow = Database['public']['Tables']['appointments']['Row']
type InvoiceRow = Database['public']['Tables']['invoices']['Row']
type CashflowRow = Database['public']['Tables']['cashflow_transactions']['Row']
type CashflowInsert = Database['public']['Tables']['cashflow_transactions']['Insert']
type EmployeeRow = Database['public']['Tables']['employees']['Row']
type EmployeeWorkRecordRow = Database['public']['Tables']['employee_work_records']['Row']
type CompanyRow = Database['public']['Tables']['company']['Row']
type QuoteRow = Database['public']['Tables']['quotes']['Row']
type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
type QuoteUpdate = Database['public']['Tables']['quotes']['Update']
type QuoteItemRow = Database['public']['Tables']['quote_items']['Row']
type QuoteItemInsert = Database['public']['Tables']['quote_items']['Insert']
type QuoteItemUpdate = Database['public']['Tables']['quote_items']['Update']
type QuoteImageRow = Database['public']['Tables']['quote_images']['Row']
type QuoteImageInsert = Database['public']['Tables']['quote_images']['Insert']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']
type EmployeeWorkRecordInsert = Database['public']['Tables']['employee_work_records']['Insert']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

async function getUid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id || null
}

async function selectOwn(table: string, columns: string): Promise<any> {
  const uid = await getUid()
  let q = supabase.from(table).select(columns)
  if (uid) q = q.eq('owner_user_id', uid)
  return q
}

async function withOwner<T extends Record<string, any>>(payload: T): Promise<T> {
  const uid = await getUid()
  if (uid) return { ...payload, owner_user_id: uid }
  return payload
}

export async function getCustomers(): Promise<CustomerRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('customers').select('*')
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base).order('name')
  if (error) throw error
  return data || []
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

export async function createCustomer(payload: CustomerInsert): Promise<CustomerRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('customers').insert([withUid]).select('*').single()
  if (error) throw error
  return data as CustomerRow
}

export async function updateCustomer(id: string, payload: CustomerUpdate): Promise<CustomerRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data as CustomerRow
}

export async function getServices(): Promise<ServiceRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('services').select('*')
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base).order('name')
  if (error) throw error
  return data || []
}

export async function deleteService(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

export async function createService(payload: ServiceInsert): Promise<ServiceRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('services').insert([withUid]).select('*').single()
  if (error) throw error
  return data as ServiceRow
}

export async function updateService(id: string, payload: ServiceUpdate): Promise<ServiceRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { data, error } = await supabase.from('services').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data as ServiceRow
}

export async function getInvoices(): Promise<InvoiceRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('invoices').select('*')
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base).order('issue_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getInvoicesWithAppointment(): Promise<(InvoiceRow & { appointments: { customers: { name: string }; services: { name: string } } })[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      issue_date,
      due_date,
      subtotal,
      tax,
      total,
      status,
      pdf_url,
      appointments ( customers (name), services (name) )
    `)
    .order('issue_date', { ascending: false }) as any
  const q = uid ? base.eq('owner_user_id', uid) : base
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getInvoiceByIdWithAppointment(id: string): Promise<(InvoiceRow & { appointments: { customers: { name: string }; services: { name: string } } }) | null> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      issue_date,
      due_date,
      subtotal,
      tax,
      total,
      status,
      pdf_url,
      appointments ( customers (name), services (name) )
    `)
    .eq('id', id) as any
  const q = uid ? base.eq('owner_user_id', uid) : base
  const { data, error } = await q.single()
  if (error) throw error
  return data || null
}

export async function getInvoicesByAppointmentIds(ids: string[]): Promise<{ appointment_id: string }[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  if (!ids || ids.length === 0) return []
  const uid = await getUid()
  const base = supabase
    .from('invoices')
    .select('appointment_id')
    .in('appointment_id', ids as any)
  const q = uid ? base.eq('owner_user_id', uid) : base
  const { data, error } = await q
  if (error) throw error
  return (data || []) as any
}

export async function createInvoice(payload: Database['public']['Tables']['invoices']['Insert']): Promise<InvoiceRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('invoices').insert([withUid]).select('*').single()
  if (error) throw error
  return data as InvoiceRow
}

export async function updateInvoiceStatus(id: string, status: InvoiceRow['status']): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Falha ao atualizar fatura')
  }
}

export async function getAppointmentsWithRelations(): Promise<(AppointmentRow & { customers: { name: string; phone: string }; services: { name: string; duration_minutes: number } })[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('appointments')
    .select(`*, customers (name, phone), services (name, duration_minutes)`) as any
  const q = uid ? base.eq('owner_user_id', uid) : base
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function deleteAppointment(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}

export async function getAppointments(): Promise<AppointmentRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('appointments').select('*')
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
  return data || []
}

export async function createAppointment(payload: AppointmentInsert): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('appointments').insert([withUid]).select('*').single()
  if (error) throw error
  return data as AppointmentRow
}

export async function updateAppointment(id: string, payload: AppointmentUpdate): Promise<AppointmentRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('appointments').update(payload).eq('id', id)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid).select('*').single() : base.select('*').single())
  if (error) throw error
  return data as AppointmentRow
}

export async function getAppointmentsForCalendar(): Promise<(AppointmentRow & { customers: { name: string; phone: string; email: string }; services: { name: string; duration_minutes: number } })[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('appointments')
    .select(`*, customers (name, phone, email), services (name, duration_minutes)`) as any
  const q = uid ? base.eq('owner_user_id', uid) : base
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export type CashflowSummary = {
  month: string | null
  summary: { income: number; expense: number; net: number }
  expenseByCategory: Record<string, number>
  incomeByClient: Array<{ client_id: string; name: string; total: number }>
}

export async function getCashflowSummary(month?: string): Promise<CashflowSummary> {
  if (!supabase) throw new Error('Supabase não configurado')
  let startDate: string | undefined
  let nextMonthDate: string | undefined
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(Date.UTC(y, m - 1, 1))
    const next = new Date(Date.UTC(y, m, 1))
    startDate = start.toISOString().slice(0, 10)
    nextMonthDate = next.toISOString().slice(0, 10)
  }

  let txQuery = supabase
    .from('cashflow_transactions')
    .select('id, type, category, amount, transaction_date, client_id') as any
  {
    const uid = await getUid()
    if (uid) txQuery = txQuery.eq('owner_user_id', uid)
  }

  if (startDate && nextMonthDate) {
    txQuery = txQuery.gte('transaction_date', startDate).lt('transaction_date', nextMonthDate)
  }

  const { data: transactions, error: txError } = await txQuery
  if (txError) throw txError

  const totalIncome = (transactions || [])
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
  const totalExpense = (transactions || [])
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
  const net = totalIncome - totalExpense

  const expenseByCategory: Record<string, number> = {}
  ;(transactions || [])
    .filter((t: any) => t.type === 'expense')
    .forEach((t: any) => {
      const cat = t.category || 'outros'
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount || 0)
    })

  let incomeByClient: Array<{ client_id: string; name: string; total: number }> = []
  const clientIds = Array.from(new Set((transactions || [])
    .filter((t: any) => t.type === 'income' && t.client_id)
    .map((t: any) => t.client_id)))

  if (clientIds.length > 0) {
    const uid = await getUid()
    const base = supabase
      .from('customers')
      .select('id, name')
      .in('id', clientIds as any)
    const { data: clients } = await (uid ? base.eq('owner_user_id', uid) : base)

    const totals: Record<string, number> = {}
    ;(transactions || [])
      .filter((t: any) => t.type === 'income' && t.client_id)
      .forEach((t: any) => {
        const cid = t.client_id as string
        totals[cid] = (totals[cid] || 0) + Number(t.amount || 0)
      })

    incomeByClient = (clients || []).map((c: any) => ({
      client_id: c.id,
      name: c.name,
      total: totals[c.id] || 0,
    }))
    incomeByClient.sort((a, b) => b.total - a.total)
  }

  return {
    month: month || null,
    summary: { income: totalIncome, expense: totalExpense, net },
    expenseByCategory,
    incomeByClient,
  }
}

export async function createCashflowExpense(input: { category: string; amount: number; date: string; description?: string | null }): Promise<CashflowRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const payload: CashflowInsert = {
    type: 'expense',
    category: input.category || 'other',
    amount: Number(input.amount || 0),
    transaction_date: (input.date || new Date().toISOString()).slice(0, 10),
    description: input.description || null,
  }
  if (!payload.amount || payload.amount <= 0) throw new Error('Valor inválido')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase
    .from('cashflow_transactions')
    .insert(withUid)
    .select('*')
    .single()
  if (error) throw error
  return data as CashflowRow
}

export async function getEmployees(): Promise<EmployeeRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('employees').select('*')
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
  return data || []
}

export async function getEmployeeWorkRecords(employeeId: string): Promise<EmployeeWorkRecordRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('employee_work_records').select('*').eq('employeeId', employeeId)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
  return data || []
}

export async function getCompany(): Promise<CompanyRow | null> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('company').select('*')
  const { data } = await (uid ? base.eq('owner_user_id', uid).single() : base.single())
  return data || null
}

export async function getEmployeeById(id: string): Promise<EmployeeRow | null> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('employees').select('*').eq('id', id)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid).single() : base.single())
  if (error) throw error
  return data || null
}

export async function createEmployee(payload: EmployeeInsert): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const cleanCpf = (payload.cpf || '').toString().replace(/\D/g, '')
  if (!cleanCpf) throw new Error('CPF inválido')
  const { data: existing } = await supabase.from('employees').select('id').eq('cpf', cleanCpf).limit(1)
  if (existing && existing.length > 0) throw new Error('CPF já cadastrado')
  const withUid = await withOwner({ ...payload, cpf: cleanCpf } as any)
  const { error } = await supabase.from('employees').insert([withUid])
  if (error) throw error
}

export async function updateEmployee(id: string, payload: EmployeeUpdate): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const cleanCpf = (payload.cpf || '').toString().replace(/\D/g, '')
  if (cleanCpf) {
    const { data: existing } = await supabase.from('employees').select('id').eq('cpf', cleanCpf).neq('id', id).limit(1)
    if (existing && existing.length > 0) throw new Error('CPF já cadastrado')
  }
  const uid = await getUid()
  const base = supabase.from('employees').update({ ...payload, cpf: cleanCpf || payload.cpf }).eq('id', id)
  const { error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
}

export async function deleteEmployee(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('employees').delete().eq('id', id)
  const { error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
}

export async function addEmployeeWorkRecord(input: { employeeId: string; workDate: string; workDays: number; dailyRate: number; notes?: string | null }): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const payload: EmployeeWorkRecordInsert = {
    employeeId: input.employeeId,
    workDate: input.workDate,
    workDays: input.workDays,
    dailyRate: input.dailyRate,
    totalAmount: Number(input.dailyRate || 0) * Number(input.workDays || 0),
    notes: input.notes || null,
    paid: false,
  }
  const withUid = await withOwner(payload as any)
  const { error } = await supabase.from('employee_work_records').insert([withUid])
  if (error) throw error
}

export async function toggleWorkRecordPaid(id: string, nextPaid: boolean): Promise<void> {
  const res = await fetch(`/api/employees/work-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paid: nextPaid })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || 'Falha ao atualizar registro de trabalho')
  }
}

export async function saveCompany(payload: CompanyRow & { id?: string }): Promise<CompanyRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const base = {
    name: payload.name,
    cnpj: payload.cnpj,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    bank_info: payload.bank_info,
    logo_url: payload.logo_url,
    updated_at: new Date().toISOString(),
  }
  if (payload.id) {
    const withUid = await withOwner(base as any)
    const { data, error } = await supabase.from('company').update(withUid).eq('id', payload.id).select('*').single()
    if (error) throw error
    return data as CompanyRow
  } else {
    const withUid = await withOwner(base as any)
    const { data, error } = await supabase.from('company').insert(withUid).select('*').single()
    if (error) throw error
    return data as CompanyRow
  }
}

// Orçamentos (quotes)
export async function getQuotes(): Promise<(QuoteRow & { customers?: { name: string; phone: string }; services?: { name: string } })[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('quotes')
    .select(`*, customers (name, phone), services (name)`) as any
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) {
    const code = (error as any).code
    if (code === 'PGRST205') return []
    throw error
  }
  return (data || []).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
}

export async function getQuoteById(id: string): Promise<(QuoteRow & { customers?: any; services?: any; quote_items: QuoteItemRow[]; quote_images: QuoteImageRow[] }) | null> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase
    .from('quotes')
    .select(`*, customers (*), services (*), quote_items (*), quote_images (*)`)
    .eq('id', id)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid).single() : base.single())
  if (error) {
    const code = (error as any).code
    if (code === 'PGRST205') return null
    throw error
  }
  return (data as any) || null
}

export async function createQuote(payload: QuoteInsert): Promise<QuoteRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('quotes').insert([withUid]).select('*').single()
  if (error) throw error
  return data as QuoteRow
}

export async function updateQuote(id: string, payload: QuoteUpdate): Promise<QuoteRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quotes').update(payload).eq('id', id)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid).select('*').single() : base.select('*').single())
  if (error) throw error
  return data as QuoteRow
}

export async function deleteQuote(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quotes').delete().eq('id', id)
  const { error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
}

export async function addQuoteItem(payload: QuoteItemInsert): Promise<QuoteItemRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('quote_items').insert([withUid]).select('*').single()
  if (error) throw error
  return data as QuoteItemRow
}

export async function updateQuoteItem(id: string, payload: QuoteItemUpdate): Promise<QuoteItemRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quote_items').update(payload).eq('id', id)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid).select('*').single() : base.select('*').single())
  if (error) throw error
  return data as QuoteItemRow
}

export async function deleteQuoteItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quote_items').delete().eq('id', id)
  const { error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
}

export async function addQuoteImage(payload: QuoteImageInsert): Promise<QuoteImageRow> {
  if (!supabase) throw new Error('Supabase não configurado')
  const withUid = await withOwner(payload as any)
  const { data, error } = await supabase.from('quote_images').insert([withUid]).select('*').single()
  if (error) throw error
  return data as QuoteImageRow
}

export async function deleteQuoteImage(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quote_images').delete().eq('id', id)
  const { error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
}

export async function listQuoteImages(quoteId: string): Promise<QuoteImageRow[]> {
  if (!supabase) throw new Error('Supabase não configurado')
  const uid = await getUid()
  const base = supabase.from('quote_images').select('*').eq('quote_id', quoteId)
  const { data, error } = await (uid ? base.eq('owner_user_id', uid) : base)
  if (error) throw error
  return data || []
}
