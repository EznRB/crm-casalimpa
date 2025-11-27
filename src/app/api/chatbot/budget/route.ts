import { NextRequest, NextResponse } from 'next/server'

const HF_MODEL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'

function buildPrompt(messages: Array<{ role: string; content: string }>, context: any) {
  const ctxParts = [] as string[]
  if (context) {
    const c = context
    ctxParts.push(`Cliente: ${c?.cliente?.name || ''}`)
    ctxParts.push(`Serviço: ${c?.servico?.name || ''}`)
    ctxParts.push(`Residência: ${c?.residencia || ''}`)
    ctxParts.push(`Área (m²): ${c?.area_m2 ?? ''}`)
    ctxParts.push(`Modalidade: ${c?.modalidade || ''}`)
    ctxParts.push(`Validade: ${c?.valid_until || ''}`)
    ctxParts.push(`Subtotal: ${c?.subtotal ?? ''}`)
    ctxParts.push(`Total: ${c?.total ?? ''}`)
    const itens = Array.isArray(c?.itens) ? c.itens.map((it: any) => `${it.description} x${it.quantity} (R$${Number(it.unit_price || 0).toFixed(2)})`).join('; ') : ''
    ctxParts.push(`Itens: ${itens}`)
  }
  const system = 'Você é um assistente de criação de orçamentos da Casa Limpa. Dê respostas curtas, práticas e acionáveis. Não invente valores; sugira com base em residência, metragem, serviço, modalidade, itens e totais. Produza também sugestões de texto para o template.'
  const user = messages?.find((m) => m.role === 'user')?.content || ''
  const prompt = `${system}
Contexto:
${ctxParts.join('\n')}
Pergunta:
${user}`
  return prompt
}

async function callHF(prompt: string) {
  const token = process.env.HF_ACCESS_TOKEN
  if (!token) return null
  const res = await fetch(HF_MODEL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 256, temperature: 0.7, top_p: 0.9 } }),
  })
  if (!res.ok) return null
  const data = await res.json()
  if (Array.isArray(data) && data[0]?.generated_text) return String(data[0].generated_text)
  if (typeof data === 'string') return data
  return JSON.stringify(data)
}

function heuristicReply(context: any, question: string) {
  const c = context || {}
  const area = Number(c?.area_m2 || 0)
  const modalidade = String(c?.modalidade || 'avulso')
  const base = `Para ${c?.residencia || 'residência'} com ${area} m² e modalidade ${modalidade.toUpperCase()}, sugiro:`
  const tempo = area <= 60 ? 'até 2h' : area <= 120 ? '2–4h' : area <= 200 ? '4–6h' : '6h+'
  const itensSugestao = [
    { description: 'Materiais de limpeza', quantity: 1, unit: 'un', unit_price: 50 },
    { description: 'Taxa de deslocamento', quantity: 1, unit: 'un', unit_price: 25 },
  ]
  const validade = c?.valid_until || new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().slice(0, 10)
  const template = `\n<p><strong>Condições</strong></p>\n<p>Execução estimada: ${tempo}. Orçamento válido até ${new Date(validade).toLocaleDateString('pt-BR')}.</p>`
  const atividades = [
    'Limpeza total do ambiente',
    'Limpeza de portas e batentes',
    'Limpeza de vidros e esquadrias',
    'Higienização de cozinha e banheiros',
  ]
  const termos = 'Orçamento inclui materiais e equipamentos. Pagamento: 30% de entrada no agendamento e restante na entrega.'
  const metodos = ['pix']
  const reply = `${base} Tempo de execução ${tempo}. Considere incluir itens padrão, atividades e termos de contrato.`
  return {
    reply,
    actions: {
      setValidUntil: validade,
      addItems: itensSugestao,
      setTemplateAppend: template,
      setActivities: atividades,
      setContractTerms: termos,
      setPaymentMethods: metodos,
    },
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = body?.messages || []
    const context = body?.context || {}
    const prompt = buildPrompt(messages, context)
    const hf = await callHF(prompt)
    if (hf) return NextResponse.json({ reply: hf })
    const h = heuristicReply(context, messages?.find((m: any) => m.role === 'user')?.content || '')
    return NextResponse.json(h)
  } catch (e) {
    return NextResponse.json({ reply: 'Não foi possível responder agora. Tente novamente.', error: true }, { status: 200 })
  }
}
