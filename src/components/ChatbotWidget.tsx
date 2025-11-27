'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ChatRole = 'user' | 'assistant' | 'tool'
type ChatMessage = { role: ChatRole; content: string; actions?: any }

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sessionId) setSessionId(crypto.randomUUID())
  }, [sessionId])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const context = useMemo(() => ({ page: 'dashboard' }), [])

  const startAssistantMessage = () => {
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
  }

  const appendToAssistant = (chunk: string) => {
    setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last && last.role === 'assistant') last.content = String(last.content || '') + chunk
      else next.push({ role: 'assistant', content: chunk })
      return next
    })
  }

  const applyActions = (actions: any) => {
    if (!actions) return
  }

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content) return
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    setInput('')
    try {
      const res = await fetch('/api/chatbot/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messages: [{ role: 'user', content }], context }),
      })
      const ct = res.headers.get('Content-Type') || ''
      if (res.body && !ct.includes('application/json')) {
        startAssistantMessage()
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          appendToAssistant(decoder.decode(value))
        }
      } else {
        const data = await res.json().catch(() => null)
        const reply = String(data?.reply || 'Sem resposta no momento.')
        setMessages((prev) => [...prev, { role: 'assistant', content: reply, actions: data?.actions }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Falha ao responder. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Resumo financeiro do mês',
    'Quais pendências de agendamento hoje?',
    'Criar cliente com nome e telefone',
    'Gerar fatura para último serviço concluído',
    'Enviar lembrete de pagamento para faturas em atraso',
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow">
          Assistente
        </button>
      ) : (
        <div className="w-[360px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-medium">Assistente do CRM</span>
            <button onClick={() => setOpen(false)} className="text-gray-500">✕</button>
          </div>
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div ref={scrollRef} className="h-72 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100'}`}>
                  {m.content}
                </div>
                {m.role === 'assistant' && m.actions && (
                  <div className="mt-2">
                    <button onClick={() => applyActions(m.actions)} className="text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-2 py-1 rounded">
                      Aplicar ação
                    </button>
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">Faça perguntas de operações, finanças, agenda e clientes.</div>
            )}
          </div>
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua pergunta" className="flex-1 border rounded px-2 py-2" />
              <button onClick={() => send()} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">
                {loading ? '...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
