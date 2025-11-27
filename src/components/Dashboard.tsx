'use client'

import { useEffect, useState } from 'react'
import { getCustomers, getAppointments, getAppointmentsWithRelations, getEmployees } from '@/lib/db'
import ChatbotWidget from '@/components/ChatbotWidget'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalCustomers: number
  totalAppointments: number
  monthlyRevenue: number
  pendingAppointments: number
  totalEmployees: number
}

interface RecentAppointment {
  id: string
  customer: { name: string }
  service: { name: string }
  appointment_date: string
  appointment_time: string
  status: string
}

interface RecentEmployee {
  id: string
  name: string
  position: string
  active: boolean
  createdAt?: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
    totalEmployees: 0
  })
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([])
  const [recentEmployees, setRecentEmployees] = useState<RecentEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const customers = await getCustomers()
      const appointments = await getAppointments()
      const employees = await getEmployees()
      const customersCount = customers.length
      const appointmentsCount = appointments.length
      const employeesCount = employees.length
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyRevenue = appointments
        .filter((a: any) => a.status === 'completed' && a.appointment_date.startsWith(currentMonth))
        .reduce((sum: number, a: any) => sum + Number(a.price || 0), 0)
      const pendingAppointments = appointments.filter((a: any) => ['scheduled', 'confirmed'].includes(a.status)).length
      const withRelations = await getAppointmentsWithRelations()
      const recentAppts = (withRelations || [])
        .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
        .slice(0, 5)
        .map((a: any) => ({
          id: a.id,
          appointment_date: a.appointment_date,
          appointment_time: a.appointment_time,
          status: a.status,
          customer: { name: a.customers?.name || '' },
          service: { name: a.services?.name || '' },
        }))

      const recentEmps = (employees || [])
        .sort((a: any, b: any) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime())
        .slice(0, 5)
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          position: e.position,
          active: !!e.active,
          createdAt: e.createdAt || e.created_at || null,
        }))

      setStats({
        totalCustomers: customersCount || 0,
        totalAppointments: appointmentsCount || 0,
        monthlyRevenue,
        pendingAppointments,
        totalEmployees: employeesCount || 0,
      })

      setRecentAppointments(recentAppts || [])
      setRecentEmployees(recentEmps || [])
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clientes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agendamentos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Receita Mensal</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Funcionários</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Próximos Agendamentos</h3>
        </div>
        <div className="p-6">
          {recentAppointments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum agendamento recente</p>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{appointment.customer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.service.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.appointment_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Funcionários Recentes</h3>
        </div>
        <div className="p-6">
          {recentEmployees.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum funcionário cadastrado</p>
          ) : (
            <div className="space-y-4">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{emp.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{emp.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{emp.active ? 'Ativo' : 'Inativo'}</p>
                    {emp.createdAt && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(emp.createdAt).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ChatbotWidget />
    </div>
  )
}
