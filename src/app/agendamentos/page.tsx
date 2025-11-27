'use client'

import { useState, useEffect } from 'react'
import CalendarView from '@/components/CalendarView'
import { Calendar, List, Clock, User, Phone, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getAppointmentsWithRelations, deleteAppointment as deleteAppointmentDb } from '@/lib/db'
import type { Database } from '@/types/supabase'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers: { name: string; phone: string }
  services: { name: string; duration_minutes: number }
}

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const data = await getAppointmentsWithRelations()
      const sorted = (data || [])
        .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
        .sort((a: any, b: any) => a.appointment_time.localeCompare(b.appointment_time))
      setAppointments(sorted as any)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      alert('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

    try {
      await deleteAppointmentDb(id)
      
      setAppointments(appointments.filter(apt => apt.id !== id))
      alert('Agendamento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      alert('Erro ao excluir agendamento')
    }
  }

  const markAsDone = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar status')
      const updated = await res.json()
      setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status: 'completed' } : apt)))
      alert('Agendamento marcado como concluído')
    } catch (e) {
      alert('Erro ao marcar como concluído')
    }
  }

  const createInvoice = async (appointment: Appointment) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id, subtotal: appointment.price, tax: 0 }),
      })
      if (!res.ok) throw new Error('Falha ao criar invoice')
      const invoice = await res.json()
      alert('Invoice criada com sucesso')
    } catch (e) {
      alert('Erro ao criar invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado'
      case 'confirmed': return 'Confirmado'
      case 'in_progress': return 'Em Andamento'
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  if (loading && viewMode === 'list') {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Agendamentos</h1>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-1" />
              Calendário
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <List className="h-4 w-4 inline mr-1" />
              Lista
            </button>
          </div>
          <Link
            href="/agendamentos/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo Agendamento
          </Link>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="py-4">
                  <div className="flex items-center space-x-4 px-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {appointment.customers.name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {appointment.appointment_time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <User className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {appointment.services.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          {appointment.customers.phone}
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/agendamentos/${appointment.id}/editar`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Link>
                      {appointment.status !== 'completed' && (
                        <button
                          onClick={() => markAsDone(appointment.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-green-300 dark:border-green-700 shadow-sm text-xs font-medium rounded text-green-700 dark:text-green-300 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-gray-800"
                        >
                          Marcar como feito
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <button
                          onClick={() => createInvoice(appointment)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-blue-300 dark:border-blue-700 shadow-sm text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800"
                        >
                          Criar Invoice
                        </button>
                      )}
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-red-300 dark:border-red-700 shadow-sm text-xs font-medium rounded text-red-700 dark:text-red-300 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum agendamento encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
