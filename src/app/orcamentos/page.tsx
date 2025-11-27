'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getQuotes, deleteQuote } from '@/lib/db'
import { Plus, FileText, Edit, Trash2, Calendar } from 'lucide-react'

interface QuoteListItem {
  id: string
  customer_id: string | null
  service_id: string | null
  residence_type: string
  area_m2: number
  service_modality: string
  valid_until: string | null
  subtotal: number
  total: number
  status: 'rascunho' | 'enviado' | 'aceito' | 'recusado' | 'expirado'
  created_at: string
  customers?: { name: string; phone: string }
  services?: { name: string }
}

export default function OrcamentosPage() {
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const fmtBRL = useMemo(() => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), [])

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const data = await getQuotes()
      setQuotes((data || []) as any)
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
      alert('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const excludeQuote = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    try {
      await deleteQuote(id)
      setQuotes(quotes.filter((q) => q.id !== id))
      alert('Orçamento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error)
      alert('Erro ao excluir orçamento')
    }
  }

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch = (
      (quote.customers?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.services?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesStatus = statusFilter ? quote.status === statusFilter : true
    return matchesSearch && matchesStatus
  }).sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <Link
          href="/orcamentos/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aceito">Aceito</option>
            <option value="recusado">Recusado</option>
            <option value="expirado">Expirado</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Residência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((q) => (
                <tr key={q.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{q.customers?.name || '—'}</div>
                    <div className="text-sm text-gray-500">{q.customers?.phone || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.services?.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.residence_type?.toUpperCase() || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.area_m2} m²</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.service_modality}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fmtBRL.format(Number(q.total || 0))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      q.status === 'aceito' ? 'bg-green-100 text-green-800' :
                      q.status === 'recusado' ? 'bg-red-100 text-red-800' :
                      q.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                      q.status === 'expirado' ? 'bg-gray-200 text-gray-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/orcamentos/${q.id}`} className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link href={`/api/orcamentos/${q.id}/pdf`} className="text-gray-700 hover:text-gray-900" target="_blank">
                        <FileText className="w-4 h-4" />
                      </Link>
                      <button onClick={() => excludeQuote(q.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuotes.length === 0 && (
            <div className="text-center py-10">
              <div className="text-gray-600 mb-3">Nenhum orçamento encontrado</div>
              <Link href="/orcamentos/novo" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Criar orçamento
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
