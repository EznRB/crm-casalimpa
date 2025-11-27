'use client'

import { useState } from 'react'

type Item = { description: string; quantity: number; unit?: string | null; unit_price: number }

export default function OrcamentoChatbot(props: {
  context: {
    cliente?: { name?: string }
    servico?: { name?: string }
    residencia?: string
    area_m2?: number
    modalidade?: string
    valid_until?: string | null
    itens?: Item[]
    subtotal?: number
    total?: number
    titulo?: string
  }
  onSetValidUntil?: (dateStr: string) => void
  onAddItem?: (item: Item) => void
  onSetTemplateAppend?: (html: string) => void
  onSetActivities?: (list: string[]) => void
  onSetContractTerms?: (text: string) => void
  onSetPaymentMethods?: (methods: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; actions?: any }>>([])

  const send = async () => {
    if (!input.trim()) return
    const next: Array<{ role: 'user' | 'assistant'; content: string; actions?: any }> = [...messages, { role: 'user', content: input }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/chatbot/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: input }], context: props.context }),
      })
      const data = await res.json()
      const reply = String(data?.reply || 'Sem resposta no momento.')
      setMessages([...next, { role: 'assistant', content: reply, actions: data?.actions }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Falha ao responder. Tente novamente.' }])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const applyActions = (actions: any) => {
    if (!actions) return
    if (actions.setValidUntil && props.onSetValidUntil) props.onSetValidUntil(actions.setValidUntil)
    if (Array.isArray(actions.addItems) && props.onAddItem) {
      for (const it of actions.addItems) props.onAddItem(it)
    }
    if (actions.setTemplateAppend && props.onSetTemplateAppend) props.onSetTemplateAppend(actions.setTemplateAppend)
    if (Array.isArray(actions.setActivities) && props.onSetActivities) props.onSetActivities(actions.setActivities)
    if (typeof actions.setContractTerms === 'string' && props.onSetContractTerms) props.onSetContractTerms(actions.setContractTerms)
    if (Array.isArray(actions.setPaymentMethods) && props.onSetPaymentMethods) props.onSetPaymentMethods(actions.setPaymentMethods)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
          Ajuda
        </button>
      ) : (
        <div className="w-[320px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium">Assistente de Orçamento</span>
            <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
          </div>
          <div className="h-64 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100'}`}>
                  {m.content}
                </div>
                {m.role === 'assistant' && m.actions && (
                  <div className="mt-2">
                    <button onClick={() => applyActions(m.actions)} className="text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">
                      Aplicar sugestão
                    </button>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">Faça perguntas como “sugira itens”, “defina validade”, “preencha texto do template”.</div>
            )}
          </div>
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua pergunta" className="flex-1 border rounded px-2 py-2" />
              <button onClick={send} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">
                {loading ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
