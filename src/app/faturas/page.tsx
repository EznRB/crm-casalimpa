'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getInvoicesWithAppointment } from '@/lib/db'
import type { Database } from '@/types/supabase'
import { FileText, Download, Eye } from 'lucide-react'

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  appointments: { customers: { name: string }; services: { name: string } }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const data = await getInvoicesWithAppointment()
      setInvoices(data || [])
    } catch (error) {
      console.error('Erro ao buscar faturas:', error)
      alert('Erro ao carregar faturas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendente',
      'paid': 'Pago',
      'overdue': 'Vencido',
      'cancelled': 'Cancelado'
    }
    return labels[status as keyof typeof labels] || status
  }

  const generatePDF = (invoiceId: string) => {
    const invoice = invoices.find((i) => i.id === invoiceId)
    if (!invoice) return
    const url = invoice.pdf_url || `/api/invoices/${invoiceId}/pdf`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Faturas</h1>
        <Link
          href="/faturas/nova"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Nova Fatura
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {invoices.length === 0 ? (
            <li className="px-6 py-12 text-center text-gray-500">
              Nenhuma fatura encontrada
            </li>
          ) : (
            invoices.map((invoice) => (
              <li key={invoice.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          Fatura #{invoice.invoice_number}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-2 text-sm text-gray-500">
                      <div className="break-words">
                        Cliente: <span className="font-medium text-gray-900">{invoice.appointments?.customers?.name || '—'}</span>
                      </div>
                      <div className="break-words">
                        Serviço: <span className="font-medium text-gray-900">{invoice.appointments?.services?.name || '—'}</span>
                      </div>
                      <div>
                        Emissão: {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        Vencimento: {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="font-semibold text-gray-900">
                        Total: R$ {invoice.total.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => generatePDF(invoice.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Baixar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/faturas/${invoice.id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
