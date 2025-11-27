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
    .from('services')
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    logger.error('services_list_failed', { ...ctx, err: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
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
  const body = await request.json()
  const { data, error } = await supabase.from('services').insert([body]).select('*').single()
  if (error) {
    logger.error('services_create_failed', { ...ctx, err: error.message })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  const res = NextResponse.json(data, { status: 201 })
  logger.info('api_request_end', { ...ctx, status: res.status, duration_ms: Date.now() - start })
  return res
}
