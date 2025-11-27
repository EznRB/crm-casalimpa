import { NextRequest } from 'next/server'
import { callHF } from '@/lib/ai/provider'
import { getAuthUser } from '@/lib/supabaseServer'
import { fetchKpis, listAgendaToday, createClient, scheduleJob, listOverdueInvoices } from '@/server/chat/tools'
import { logger } from '@/lib/logger'
import { allow } from '@/lib/ratelimit'

function buildPrompt(messages: Array<{ role: string; content: string }>, context: any, authUser: any) {
  const userMsg = messages?.find((m) => m.role === 'user')?.content || ''
  const parts = [] as string[]
  const page = String(context?.page || 'dashboard')
  parts.push(`Página: ${page}`)
  if (authUser) parts.push(`Usuário: ${authUser?.email || authUser?.id || ''}`)
  const system = 'Você é o assistente do CRM Casa Limpa. Responda de forma objetiva e prática. Ajude com finanças, agenda, clientes e faturas. Quando conveniente, sugira passos acionáveis. Não invente dados internos; ofereça ações para consultar ou criar informações.'
  return `${system}\nContexto:\n${parts.join('\n')}\nPergunta:\n${userMsg}`
}

function heuristicReply(context: any, question: string) {
  const reply = 'Posso consultar pendências, gerar resumo financeiro, criar clientes, agendar serviços e enviar lembretes de pagamento. Diga o que deseja e confirmarei antes de executar.'
  return { reply }
}

function streamText(text: string) {
  const encoder = new TextEncoder()
  const chunks = text.match(/.{1,80}/g) || [text]
  return new ReadableStream({
    start(controller) {
      let i = 0
      let delay = 15
      const push = () => {
        if (i >= chunks.length) { controller.close(); return }
        controller.enqueue(encoder.encode(chunks[i]))
        i += 1
        if (delay < 60) delay += 1
        setTimeout(push, delay)
      }
      push()
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const start = Date.now()
    const ctx = { requestId: req.headers.get('x-request-id') || undefined, path: req.nextUrl.pathname, method: req.method }
    logger.info('api_request_start', ctx)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null
    if (!allow(ip, 'chatbot', 60, 60_000)) {
      logger.warn('rate_limited', { ...ctx })
      return Response.json({ reply: 'Muitas solicitações. Tente novamente mais tarde.' }, { status: 429 })
    }
    const body = await req.json()
    const messages = body?.messages || []
    const context = body?.context || {}
    const { user } = await getAuthUser(req)
    const question = messages?.find((m: any) => m.role === 'user')?.content || ''
    const qlow = String(question).toLowerCase()
    if (qlow.includes('resumo financeiro') || qlow.includes('kpi')) {
      const kpis = await fetchKpis(req)
      const reply = `Clientes: ${kpis.totalCustomers}. Agendamentos: ${kpis.totalAppointments}. Receita mensal: R$ ${kpis.monthlyRevenue.toLocaleString('pt-BR')}. Pendentes: ${kpis.pendingAppointments}.`
      const res = Response.json({ reply })
      logger.info('api_request_end', { ...ctx, status: 200, duration_ms: Date.now() - start })
      return res
    }
    if (qlow.includes('pendências') || qlow.includes('agenda')) {
      const items = await listAgendaToday(req)
      const text = items.map((i) => `${i.time || ''} ${i.customer} - ${i.service} (${i.status})`).join('\n') || 'Sem compromissos para hoje.'
      const res = Response.json({ reply: text })
      logger.info('api_request_end', { ...ctx, status: 200, duration_ms: Date.now() - start })
      return res
    }
    if (qlow.includes('faturas em atraso') || qlow.includes('lembrete de pagamento')) {
      const items = await listOverdueInvoices(req)
      const text = items.map((i) => `#${i.invoice_number} ${i.client_name} venceu em ${new Date(i.due_date).toLocaleDateString('pt-BR')} (R$ ${Number(i.total || 0).toLocaleString('pt-BR')})`).join('\n') || 'Nenhuma fatura em atraso.'
      const res = Response.json({ reply: text })
      logger.info('api_request_end', { ...ctx, status: 200, duration_ms: Date.now() - start })
      return res
    }
    const prompt = buildPrompt(messages, context, user)
    const hf = await callHF(prompt)
    if (hf) {
      logger.info('chatbot_stream_start', ctx)
      return new Response(streamText(hf), { headers: { 'Content-Type': 'text/plain' } })
    }
    const h = heuristicReply(context, messages?.find((m: any) => m.role === 'user')?.content || '')
    const res = Response.json(h)
    logger.info('api_request_end', { ...ctx, status: 200, duration_ms: Date.now() - start })
    return res
  } catch (err: any) {
    logger.error('chatbot_error', { ...ctx, err: err?.message || String(err) })
    return Response.json({ reply: 'Não foi possível responder agora. Tente novamente.', error: true }, { status: 200 })
  }
}
