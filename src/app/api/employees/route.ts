import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabaseServer'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const start = Date.now()
  const ctx = { requestId: request.headers.get('x-request-id') || undefined, path: request.nextUrl.pathname, method: request.method }
  logger.info('api_request_start', ctx)
  const { supabase, user } = await getAuthUser(request)
  if (!user) {
    logger.warn('not_authenticated', ctx)
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    logger.error('employees_list_failed', { ...ctx, err: error.message })
    return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 })
  }
  const res = NextResponse.json(data ?? [])
  logger.info('api_request_end', { ...ctx, status: res.status, duration_ms: Date.now() - start })
  return res
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  const ctx = { requestId: request.headers.get('x-request-id') || undefined, path: request.nextUrl.pathname, method: request.method }
  logger.info('api_request_start', ctx)
  const { supabase, user } = await getAuthUser(request)
  if (!user) {
    logger.warn('not_authenticated', ctx)
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const cleanCpf = String(body.cpf ?? '').replace(/\D/g, '')
    const { data: existing, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('cpf', cleanCpf)
      .limit(1)
    if (checkError) throw checkError
    if (existing && existing.length > 0) {
      const res = NextResponse.json({ error: 'CPF já cadastrado para outro funcionário' }, { status: 409 })
      logger.warn('employees_duplicate_cpf', { ...ctx, status: res.status })
      return res
    }
    const { data, error } = await supabase
      .from('employees')
      .insert([{ name: body.name, email: body.email ?? null, phone: body.phone, cpf: cleanCpf, position: body.position ?? 'Funcionário', dailyRate: 150, notes: body.notes ?? null, active: body.active ?? true }])
      .select('*')
      .single()
    if (error) throw error
    const res = NextResponse.json(data, { status: 201 })
    logger.info('api_request_end', { ...ctx, status: res.status, duration_ms: Date.now() - start })
    return res
  } catch (error: any) {
    logger.error('employees_create_failed', { ...ctx, err: error?.message || String(error) })
    return NextResponse.json({ error: 'Erro ao criar funcionário' }, { status: 500 })
  }
}
