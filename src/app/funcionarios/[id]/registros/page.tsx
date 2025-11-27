'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Calendar, DollarSign, CheckCircle, XCircle, Save } from 'lucide-react'
import { getEmployeeById, getEmployeeWorkRecords, addEmployeeWorkRecord, toggleWorkRecordPaid } from '@/lib/db'
import type { Database } from '@/types/supabase'

type EmployeeRow = Database['public']['Tables']['employees']['Row']
type Employee = Pick<EmployeeRow, 'id' | 'name' | 'dailyRate'>
type WorkRecord = Database['public']['Tables']['employee_work_records']['Row']

export default function EmployeeWorkRecordsPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string
  
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    workDate: new Date().toISOString().split('T')[0],
    workDays: 1,
    dailyRate: 150,
    notes: ''
  })

  useEffect(() => {
    fetchEmployeeAndRecords()
  }, [employeeId])

  const fetchEmployeeAndRecords = async () => {
    try {
      const emp = await getEmployeeById(employeeId)
      if (!emp) throw new Error('Funcionário não encontrado')
      setEmployee({ id: emp.id, name: emp.name, dailyRate: emp.dailyRate })
      const recs = await getEmployeeWorkRecords(employeeId)
      setWorkRecords((recs || []).sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()) as any)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await addEmployeeWorkRecord({
        employeeId,
        workDate: formData.workDate,
        workDays: formData.workDays,
        dailyRate: formData.dailyRate,
        notes: formData.notes || null,
      })

      setShowForm(false)
      setFormData({
        workDate: new Date().toISOString().split('T')[0],
        workDays: 1,
        dailyRate: employee?.dailyRate || 150,
        notes: ''
      })
      fetchEmployeeAndRecords()
    } catch (error) {
      console.error('Erro ao criar registro:', error)
      alert('Erro ao criar registro de trabalho')
    }
  }

  const togglePaidStatus = async (recordId: string, currentStatus: boolean) => {
    try {
      await toggleWorkRecordPaid(recordId, !currentStatus)
      fetchEmployeeAndRecords()
    } catch (error) {
      alert('Erro ao atualizar status de pagamento')
    }
  }

  const calculateTotalToPay = () => {
    return workRecords
      .filter(record => !record.paid)
      .reduce((total, record) => total + record.totalAmount, 0)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Funcionário não encontrado</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/funcionarios"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para Funcionários
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{employee.name}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Registros de trabalho e pagamentos
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">R$ {calculateTotalToPay().toFixed(2)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{workRecords.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total de Registros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {workRecords.filter(r => !r.paid).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Registros Pendentes</div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Registros de Trabalho</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Adicionar Registro</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data do Trabalho
              </label>
              <input
                type="date"
                value={formData.workDate}
                onChange={(e) => setFormData(prev => ({ ...prev, workDate: e.target.value }))}
                required
                className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dias Trabalhados
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.workDays}
                onChange={(e) => setFormData(prev => ({ ...prev, workDays: parseFloat(e.target.value) }))}
                required
                className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor da Diária (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={employee?.dailyRate || 150}
                readOnly
                required
                className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </button>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {workRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum registro de trabalho encontrado
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {workRecords.map((record) => (
              <li key={record.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {new Date(record.workDate).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.paid
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {record.paid ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Dias Trabalhados:</span> {record.workDays}
                        </div>
                        <div>
                          <span className="font-medium">Diária:</span> R$ {record.dailyRate.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> R$ {record.totalAmount.toFixed(2)}
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Observações:</span> {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => togglePaidStatus(record.id, record.paid)}
                        className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                          record.paid
                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-900 dark:hover:bg-yellow-800'
                            : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 dark:border-green-600 dark:text-green-400 dark:bg-green-900 dark:hover:bg-green-800'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                      >
                        {record.paid ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Marcar como Pendente
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar como Pago
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
