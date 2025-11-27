'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getQuoteById, updateQuote, addQuoteItem, updateQuoteItem, deleteQuoteItem } from '@/lib/db'
import { Save, ChevronLeft, Plus, Bold, Italic, Underline, FileText, X } from 'lucide-react'
import OrcamentoChatbot from '@/components/OrcamentoChatbot'

interface QuoteItemRow { id: string; description: string; quantity: number; unit: string | null; unit_price: number; total: number }

export default function EditarOrcamentoPage() {
  const params = useParams() as { id?: string }
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quote, setQuote] = useState<any | null>(null)
  const [items, setItems] = useState<QuoteItemRow[]>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const [richHtml, setRichHtml] = useState<string>('')
  const [activityInput, setActivityInput] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const data = await getQuoteById(id)
        setQuote(data)
        setItems((data?.quote_items || []) as any)
        setRichHtml((data?.rich_content?.html as string) || '')
        const pm = (data as any)?.payment_methods || []
        setPaymentMethods(Array.isArray(pm) ? pm : [])
      } catch (e) {
        console.error('Erro ao carregar orçamento:', e)
        alert('Erro ao carregar orçamento')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.unit_price || 0) * Number(it.quantity || 0), 0)
  }, [items])
  const total = useMemo(() => {
    const d = Math.max(0, Math.min(Number(quote?.discount || 0), subtotal))
    const t = Math.max(0, Number(quote?.taxes || 0))
    return subtotal - d + t
  }, [subtotal, quote?.discount, quote?.taxes])
  const fmtBRL = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), [])

  const applyFormat = (cmd: 'bold' | 'italic' | 'underline') => {
    document.execCommand(cmd)
    setRichHtml(editorRef.current?.innerHTML || '')
  }
  const onEditorInput = () => {
    setRichHtml(editorRef.current?.innerHTML || '')
  }

  const addItemRow = async () => {
    const temp = { description: '', quantity: 1, unit: 'un', unit_price: 0, total: 0 }
    setItems([...items, temp as any])
  }

  const addActivity = () => {
    if (!activityInput.trim()) return
    const activities = Array.isArray((quote as any)?.activities) ? [...(quote as any).activities] : []
    activities.push(activityInput.trim())
    setQuote({ ...(quote as any), activities })
    setActivityInput('')
  }

  const handleSave = async () => {
    if (!quote) return
    setSaving(true)
    try {
      const payload = {
        residence_type: quote.residence_type,
        area_m2: Number(quote.area_m2 || 0),
        service_modality: quote.service_modality,
        valid_until: quote.valid_until || null,
        discount: Number(quote.discount || 0),
        taxes: Number(quote.taxes || 0),
        subtotal: Number(subtotal || 0),
        total: Number(total || 0),
        status: quote.status,
        notes: quote.notes || null,
        rich_content: { html: richHtml } as any,
        title: (quote as any).title || 'Orçamento',
        initial_report: (quote as any).initial_report || null,
        activities: Array.isArray((quote as any).activities) ? (quote as any).activities : null,
        payment_methods: paymentMethods.length ? paymentMethods : null,
        contract_terms: (quote as any).contract_terms || null,
        client_label: (quote as any).client_label || null,
        client_subtitle: (quote as any).client_subtitle || null,
      }
      await updateQuote(quote.id, payload as any)
      // Persist newly added items (without id)
      for (const it of items) {
        if (!it.id) {
          await addQuoteItem({
            quote_id: quote.id,
            description: it.description,
            quantity: Number(it.quantity || 0),
            unit: it.unit || 'un',
            unit_price: Number(it.unit_price || 0),
            total: Number(it.unit_price || 0) * Number(it.quantity || 0),
          })
        } else {
          await updateQuoteItem(it.id, {
            description: it.description,
            quantity: Number(it.quantity || 0),
            unit: it.unit || 'un',
            unit_price: Number(it.unit_price || 0),
            total: Number(it.unit_price || 0) * Number(it.quantity || 0),
          } as any)
        }
      }
      alert('Orçamento atualizado!')
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      alert('Erro ao salvar orçamento')
    } finally {
      setSaving(false)
    }
  }

  const removeItemRow = async (idx: number) => {
    const it = items[idx]
    const arr = items.filter((_, i) => i !== idx)
    setItems(arr)
    if (it?.id) {
      try { await deleteQuoteItem(it.id) } catch (e) { console.error(e) }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="space-y-4">
        <Link href="/orcamentos" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="text-gray-600">Orçamento não encontrado.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/orcamentos" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/api/orcamentos/${quote.id}/pdf`} target="_blank" className="bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2">
            <FileText className="w-4 h-4" /> PDF
          </Link>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de residência</label>
              <select value={quote.residence_type} onChange={(e) => setQuote({ ...quote, residence_type: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Área (m²)</label>
              <input type="number" value={quote.area_m2 || 0} onChange={(e) => setQuote({ ...quote, area_m2: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Modalidade</label>
              <select value={quote.service_modality} onChange={(e) => setQuote({ ...quote, service_modality: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="avulso">Avulso</option>
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Validade</label>
              <input type="date" value={quote.valid_until || ''} onChange={(e) => setQuote({ ...quote, valid_until: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Relatório Inicial</label>
            <textarea value={(quote as any)?.initial_report || ''} onChange={(e) => setQuote({ ...(quote as any), initial_report: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" rows={5} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => applyFormat('bold')} className="px-2 py-1 border rounded"><Bold className="w-4 h-4" /></button>
            <button type="button" onClick={() => applyFormat('italic')} className="px-2 py-1 border rounded"><Italic className="w-4 h-4" /></button>
            <button type="button" onClick={() => applyFormat('underline')} className="px-2 py-1 border rounded"><Underline className="w-4 h-4" /></button>
          </div>
          <div ref={editorRef} contentEditable onInput={onEditorInput} className="min-h-[160px] border rounded-lg p-3 focus:outline-none" dangerouslySetInnerHTML={{ __html: richHtml }} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea value={quote.notes || ''} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" rows={3} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-medium">Itens do orçamento</span>
          <button onClick={addItemRow} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar item</button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor unitário</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="px-3 py-2"><input value={it.description} onChange={(e) => {
                    const v = e.target.value; const arr = [...items]; arr[idx].description = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input type="number" value={it.quantity} onChange={(e) => {
                    const v = Number(e.target.value); const arr = [...items]; arr[idx].quantity = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input value={it.unit || 'un'} onChange={(e) => {
                    const v = e.target.value; const arr = [...items]; arr[idx].unit = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input type="number" value={it.unit_price} onChange={(e) => {
                    const v = Number(e.target.value); const arr = [...items]; arr[idx].unit_price = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2 text-sm">R$ {(Number(it.unit_price || 0) * Number(it.quantity || 0)).toFixed(2)}</td>
                  <td className="px-3 py-2"><button onClick={() => removeItemRow(idx)} className="text-red-600 hover:text-red-800 flex items-center gap-1"><X className="w-4 h-4" /> Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Desconto</label>
            <input type="number" value={quote.discount || 0} onChange={(e) => setQuote({ ...quote, discount: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Taxas</label>
            <input type="number" value={quote.taxes || 0} onChange={(e) => setQuote({ ...quote, taxes: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="text-right">
            <div className="text-sm">Subtotal: <strong>{fmtBRL.format(subtotal)}</strong></div>
            <div className="text-sm">Desconto: <strong>{fmtBRL.format(Math.max(0, Math.min(Number(quote?.discount || 0), subtotal)))}</strong></div>
            <div className="text-sm">Taxas: <strong>{fmtBRL.format(Math.max(0, Number(quote?.taxes || 0)))}</strong></div>
            <div className="text-lg">Total: <strong>{fmtBRL.format(total)}</strong></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-medium">Descrição das atividades</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <input value={activityInput} onChange={(e) => setActivityInput(e.target.value)} className="flex-1 border rounded px-2 py-2" placeholder="Ex.: Limpeza total do apartamento" />
            <button onClick={addActivity} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Adicionar</button>
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {(Array.isArray((quote as any)?.activities) ? (quote as any).activities : []).map((a: string, idx: number) => (
              <li key={idx} className="flex justify-between items-center">
                <span>{a}</span>
                <button onClick={() => setQuote({ ...(quote as any), activities: (quote as any).activities.filter((_: string, i: number) => i !== idx) })} className="text-red-600 text-sm">Remover</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <span className="font-medium">Imagens</span>
        </div>
        <div className="p-4 space-y-3">
          <input type="file" multiple onChange={async (e) => {
            const files = e.target.files
            if (!files || !supabase || !quote?.id) return
            setUploading(true)
            try {
              const bucket = supabase.storage.from('quotes')
              for (const file of Array.from(files)) {
                const path = `${quote.id}/${Date.now()}-${file.name}`
                const { error: upErr } = await bucket.upload(path, file, { upsert: true })
                if (upErr) continue
                const { data: pub } = bucket.getPublicUrl(path)
                await fetch('/api/quotes/images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quote_id: quote.id, url: pub.publicUrl }) })
              }
              alert('Imagens enviadas')
            } finally {
              setUploading(false)
            }
          }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(quote as any)?.quote_images?.map((img: any) => (
              <div key={img.id} className="relative">
                <img src={img.url} alt={img.caption || ''} className="w-full h-24 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <span className="font-medium">Métodos de pagamento</span>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {['pix','transferencia','cartao','dinheiro'].map((m) => (
            <label key={m} className="inline-flex items-center gap-2">
              <input type="checkbox" checked={paymentMethods.includes(m)} onChange={(e) => setPaymentMethods((prev) => e.target.checked ? [...prev, m] : prev.filter((x) => x !== m))} />
              <span className="capitalize">{m}</span>
            </label>
          ))}
        </div>
      </div>
      <OrcamentoChatbot
        context={{
          titulo: (quote as any)?.title,
          cliente: quote?.customers || undefined,
          servico: quote?.services || undefined,
          residencia: quote?.residence_type,
          area_m2: quote?.area_m2,
          modalidade: quote?.service_modality,
          valid_until: quote?.valid_until || null,
          itens: items.map((it) => ({ description: it.description, quantity: it.quantity, unit: it.unit || 'un', unit_price: it.unit_price })),
          subtotal,
          total,
        }}
        onSetValidUntil={(d) => setQuote((q: any) => ({ ...q, valid_until: d }))}
        onAddItem={(it) => setItems((prev) => [...prev, { id: '', description: it.description, quantity: it.quantity, unit: it.unit || 'un', unit_price: it.unit_price, total: Number(it.unit_price || 0) * Number(it.quantity || 0) }])}
        onSetTemplateAppend={(html) => setRichHtml((prev) => (prev || '') + html)}
        onSetActivities={(list) => setQuote((q: any) => ({ ...q, activities: list }))}
        onSetContractTerms={(text) => setQuote((q: any) => ({ ...q, contract_terms: text }))}
        onSetPaymentMethods={(methods) => setPaymentMethods(methods)}
      />
    </div>
  )
}
