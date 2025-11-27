'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAppointmentsWithRelations, createInvoice as createInvoiceDb, getInvoicesByAppointmentIds } from '@/lib/db'
import { useRouter } from 'next/navigation'

interface AppointmentOption {
  id: string
  price: number
  customers: { name: string }
  services: { name: string }
}

export default function NovaFaturaPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentOption[]>([])
  const [appointmentId, setAppointmentId] = useState('')
  const [subtotal, setSubtotal] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEligibleAppointments()
  }, [])

  const fetchEligibleAppointments = async () => {
    try {
      const appts = await getAppointmentsWithRelations()
      const completed = (appts || []).filter((a: any) => a.status === 'completed')
      const ids = completed.map((a: any) => a.id)
      const existing = await getInvoicesByAppointmentIds(ids)
      const invoicedIds = new Set((existing || []).map((i: any) => i.appointment_id))
      const eligible = completed.filter((a: any) => !invoicedIds.has(a.id)).map((a: any) => ({
        id: a.id,
        price: a.price,
        customers: { name: a.customers?.name || '' },
        services: { name: a.services?.name || '' },
      }))
      setAppointments(eligible as any)
    } finally {
      setLoading(false)
    }
  }

  const onSelectAppointment = (id: string) => {
    setAppointmentId(id)
    const apt = appointments.find((a) => a.id === id)
    setSubtotal(apt ? apt.price : 0)
  }

  const total = (subtotal || 0) + (tax || 0)

  const handleCreateInvoice = async () => {
    if (!appointmentId) {
      alert('Selecione um agendamento')
      return
    }
    try {
      const created = await createInvoiceDb({
        appointment_id: appointmentId,
        invoice_number: String(Math.floor(Math.random() * 900000) + 100000),
        subtotal,
        tax,
        total: subtotal + tax,
        status: 'pending',
      } as any)
      router.push(`/faturas/${created.id}`)
    } catch (e) {
      alert('Erro ao criar fatura')
    }
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nova Fatura</h1>
        <Link
          href="/faturas"
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Voltar
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Agendamento</span>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={appointmentId}
                onChange={(e) => onSelectAppointment(e.target.value)}
              >
                <option value="">Selecione...</option>
                {appointments.map((apt) => (
                  <option key={apt.id} value={apt.id}>
                    {apt.customers.name} • {apt.services.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtotal (R$)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={subtotal}
                  onChange={(e) => setSubtotal(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Imposto (R$)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total (R$)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  value={total}
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateInvoice}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Criar Fatura
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
