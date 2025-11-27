'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { getCustomers, getServices, createQuote, addQuoteItem } from '@/lib/db'
import { Save, ChevronLeft, Plus, Bold, Italic, Underline, X } from 'lucide-react'
import OrcamentoChatbot from '@/components/OrcamentoChatbot'

interface Customer { id: string; name: string; phone: string }
interface Service { id: string; name: string; base_price: number; duration_minutes: number }
interface QuoteItemForm { id?: string; description: string; quantity: number; unit: string; unit_price: number }

export default function NovoOrcamentoPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customerId, setCustomerId] = useState<string>('')
  const [serviceId, setServiceId] = useState<string>('')
  const [residenceType, setResidenceType] = useState<string>('casa')
  const [areaM2, setAreaM2] = useState<number>(0)
  const [serviceModality, setServiceModality] = useState<string>('avulso')
  const [validUntil, setValidUntil] = useState<string>('')
  const [discount, setDiscount] = useState<number>(0)
  const [taxes, setTaxes] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [items, setItems] = useState<QuoteItemForm[]>([])
  const [richHtml, setRichHtml] = useState<string>('')
  const editorRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [clientLabel, setClientLabel] = useState<string>('')
  const [clientSubtitle, setClientSubtitle] = useState<string>('')
  const [initialReport, setInitialReport] = useState<string>('')
  const [activities, setActivities] = useState<string[]>([])
  const [activityInput, setActivityInput] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [contractTerms, setContractTerms] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      try {
        const [c, s] = await Promise.all([getCustomers(), getServices()])
        setCustomers(c || [])
        setServices(s || [])
      } catch (e) {
        console.error('Erro ao carregar dados base:', e)
        alert('Erro ao carregar clientes/serviços')
      }
    })()
  }, [])

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.unit_price || 0) * Number(it.quantity || 0), 0)
  }, [items])
  const total = useMemo(() => {
    const d = Math.max(0, Math.min(Number(discount || 0), subtotal))
    const t = Math.max(0, Number(taxes || 0))
    return subtotal - d + t
  }, [subtotal, discount, taxes])
  const fmtBRL = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), [])
  const isValid = useMemo(() => Boolean(customerId && serviceId && residenceType && areaM2 > 0 && serviceModality), [customerId, serviceId, residenceType, areaM2, serviceModality])

  const addItemRow = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'un', unit_price: 0 }])
  }
  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const applyFormat = (cmd: 'bold' | 'italic' | 'underline') => {
    document.execCommand(cmd)
    setRichHtml(editorRef.current?.innerHTML || '')
  }

  const buildDefaultTemplate = () => {
    const cliente = customers.find((c) => c.id === customerId)
    const servico = services.find((s) => s.id === serviceId)
    return `
      <p><strong>Orçamento de Serviço</strong></p>
      <p>Cliente: ${cliente?.name || ''}</p>
      <p>Serviço: ${servico?.name || ''}</p>
      <p>Residência: ${residenceType.toUpperCase()} — Área: ${areaM2} m²</p>
      <p>Modalidade: ${serviceModality.toUpperCase()}</p>
      <p>Validade: ${validUntil ? new Date(validUntil).toLocaleDateString('pt-BR') : '—'}</p>
      <p>Itens e valores conforme tabela.</p>
    `
  }

  const onEditorInput = () => {
    setRichHtml(editorRef.current?.innerHTML || '')
  }

  const handleSave = async () => {
    if (!customerId) { alert('Selecione um cliente'); return }
    if (!serviceId) { alert('Selecione um serviço'); return }
    if (!(areaM2 > 0)) { alert('Informe a área em m²'); return }
    setSaving(true)
    try {
      const payload = {
        title: title || 'Orçamento',
        customer_id: customerId,
        service_id: serviceId,
        residence_type: residenceType,
        area_m2: Number(areaM2 || 0),
        service_modality: serviceModality,
        valid_until: validUntil || null,
        discount: Number(discount || 0),
        taxes: Number(taxes || 0),
        subtotal: Number(subtotal || 0),
        total: Number(total || 0),
        status: 'rascunho' as const,
        notes: notes || null,
        rich_content: { html: richHtml || buildDefaultTemplate() } as any,
        initial_report: initialReport || null,
        activities: activities.length ? activities : null,
        payment_methods: paymentMethods.length ? paymentMethods : null,
        contract_terms: contractTerms || null,
        client_label: clientLabel || null,
        client_subtitle: clientSubtitle || null,
      }
      const quote = await createQuote(payload as any)
      for (const it of items) {
        await addQuoteItem({
          quote_id: quote.id,
          description: it.description,
          quantity: Number(it.quantity || 0),
          unit: it.unit || 'un',
          unit_price: Number(it.unit_price || 0),
          total: Number(it.unit_price || 0) * Number(it.quantity || 0),
        })
      }
      alert('Orçamento criado com sucesso!')
      window.location.href = `/orcamentos/${quote.id}`
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      alert('Erro ao salvar orçamento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/orcamentos" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isValid}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          Salvar Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título do serviço</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Ex.: Limpeza pós obra" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="">Selecione...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rótulo do cliente</label>
              <input value={clientLabel} onChange={(e) => setClientLabel(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Ex.: Arquiteta Flávia" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
              <input value={clientSubtitle} onChange={(e) => setClientSubtitle(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Ex.: Condomínio ..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serviço</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
              <option value="">Selecione...</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de residência</label>
              <select value={residenceType} onChange={(e) => setResidenceType(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Área (m²)</label>
              <input type="number" value={areaM2} onChange={(e) => setAreaM2(Number(e.target.value))} className="mt-1 w-full border rounded-lg px-3 py-2" />
              {!areaM2 && <div className="text-xs text-red-600 mt-1">Informe a área em m²</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Modalidade</label>
              <select value={serviceModality} onChange={(e) => setServiceModality(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="avulso">Avulso</option>
                <option value="mensal">Mensal</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Validade</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Relatório Inicial</label>
            <textarea value={initialReport} onChange={(e) => setInitialReport(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" rows={5} placeholder="Descreva o contexto do serviço..." />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => applyFormat('bold')} className="px-2 py-1 border rounded">
              <Bold className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('italic')} className="px-2 py-1 border rounded">
              <Italic className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('underline')} className="px-2 py-1 border rounded">
              <Underline className="w-4 h-4" />
            </button>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={onEditorInput}
            className="min-h-[160px] border rounded-lg p-3 focus:outline-none"
            dangerouslySetInnerHTML={{ __html: richHtml || buildDefaultTemplate() }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" rows={3} />
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
            <button onClick={() => { if (activityInput.trim()) { setActivities([...activities, activityInput.trim()]); setActivityInput('') } }} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded">Adicionar</button>
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {activities.map((a, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span>{a}</span>
                <button onClick={() => setActivities(activities.filter((_, i) => i !== idx))} className="text-red-600 text-sm">Remover</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-medium">Itens do orçamento</span>
          <button onClick={addItemRow} className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar item
          </button>
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
                <tr key={idx}>
                  <td className="px-3 py-2"><input value={it.description} onChange={(e) => {
                    const v = e.target.value; const arr = [...items]; arr[idx].description = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input type="number" value={it.quantity} onChange={(e) => {
                    const v = Number(e.target.value); const arr = [...items]; arr[idx].quantity = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input value={it.unit} onChange={(e) => {
                    const v = e.target.value; const arr = [...items]; arr[idx].unit = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2"><input type="number" value={it.unit_price} onChange={(e) => {
                    const v = Number(e.target.value); const arr = [...items]; arr[idx].unit_price = v; setItems(arr)
                  }} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-3 py-2 text-sm">R$ {(Number(it.unit_price || 0) * Number(it.quantity || 0)).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeItemRow(idx)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                      <X className="w-4 h-4" /> Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Desconto</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Taxas</label>
            <input type="number" value={taxes} onChange={(e) => setTaxes(Number(e.target.value))} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="text-right">
            <div className="text-sm">Subtotal: <strong>{fmtBRL.format(subtotal)}</strong></div>
            <div className="text-sm">Desconto: <strong>{fmtBRL.format(Math.max(0, Math.min(Number(discount || 0), subtotal)))}</strong></div>
            <div className="text-sm">Taxas: <strong>{fmtBRL.format(Math.max(0, Number(taxes || 0)))}</strong></div>
            <div className="text-lg">Total: <strong>{fmtBRL.format(total)}</strong></div>
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

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <span className="font-medium">Condições de contrato</span>
        </div>
        <div className="p-4">
          <textarea value={contractTerms} onChange={(e) => setContractTerms(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} placeholder="Ex.: Orçamento inclui materiais e equipamentos; 30% de entrada..." />
        </div>
      </div>
      <OrcamentoChatbot
        context={{
          titulo: title,
          cliente: customers.find((c) => c.id === customerId) || undefined,
          servico: services.find((s) => s.id === serviceId) || undefined,
          residencia: residenceType,
          area_m2: areaM2,
          modalidade: serviceModality,
          valid_until: validUntil || null,
          itens: items.map((it) => ({ description: it.description, quantity: it.quantity, unit: it.unit, unit_price: it.unit_price })),
          subtotal,
          total,
        }}
        onSetValidUntil={(d) => setValidUntil(d)}
        onAddItem={(it) => setItems((prev) => [...prev, { description: it.description, quantity: it.quantity, unit: it.unit || 'un', unit_price: it.unit_price }])}
        onSetTemplateAppend={(html) => setRichHtml((prev) => (prev || buildDefaultTemplate()) + html)}
        onSetActivities={(list) => setActivities(list)}
        onSetContractTerms={(text) => setContractTerms(text)}
        onSetPaymentMethods={(methods) => setPaymentMethods(methods)}
      />
    </div>
  )
}
