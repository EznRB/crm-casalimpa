'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { updateInvoiceStatus, getInvoiceByIdWithAppointment } from '@/lib/db'
import { useParams, useRouter } from 'next/navigation'
import { FileText, Download } from 'lucide-react'

interface InvoiceDetail {
  id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  pdf_url: string | null
  appointments: {
    customers: { name: string }
    services: { name: string }
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string)
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const data = await getInvoiceByIdWithAppointment(id)
      setInvoice(data as InvoiceDetail)
    } catch (e) {
      alert('Erro ao carregar fatura')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: InvoiceDetail['status']) => {
    try {
      if (!id) return
      await updateInvoiceStatus(id, status)
      setInvoice((prev) => (prev ? { ...prev, status } : prev))
      alert('Status atualizado')
    } catch (e) {
      alert('Erro ao atualizar status')
    }
  }

  const openPDF = () => {
    if (!invoice) return
    const url = invoice.pdf_url || `/api/invoices/${invoice.id}/pdf`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Fatura não encontrada</p>
        <Link href="/faturas" className="text-primary-600">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Fatura #{invoice.invoice_number}</h1>
        <Link
          href="/faturas"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Voltar
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-700">
            {invoice.appointments.customers.name} • {invoice.appointments.services.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Emissão</div>
            <div className="font-medium text-gray-900">{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Vencimento</div>
            <div className="font-medium text-gray-900">{new Date(invoice.due_date).toLocaleDateString('pt-BR')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="font-medium text-gray-900">R$ {invoice.subtotal.toLocaleString('pt-BR')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Imposto</div>
            <div className="font-medium text-gray-900">R$ {invoice.tax.toLocaleString('pt-BR')}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Total</div>
            <div className="font-semibold text-gray-900">R$ {invoice.total.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => updateStatus('paid')}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Marcar como Pago
          </button>
          <button
            onClick={() => updateStatus('cancelled')}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Cancelar
          </button>
          <button
            onClick={openPDF}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50"
            title="Baixar PDF"
          >
            <Download className="h-4 w-4 inline mr-1" />
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}
