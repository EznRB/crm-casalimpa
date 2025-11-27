'use client'

import { useEffect, useState } from 'react'
import { getAppointmentsForCalendar, getCustomers, getServices, createAppointment } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  price: number
  notes: string | null
  customer_id: string
  service_id: string
  series_id: string | null
  customers: { name: string; phone: string; email: string }
  services: { name: string; duration_minutes: number }
}

interface SeriesMeta {
  id: string
  start_date: string
  estimated_end_date: string | null
  status: string
}

export default function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [services, setServices] = useState<{ id: string; name: string; base_price: number; duration_minutes: number }[]>([])
  const [customerId, setCustomerId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [seriesMap, setSeriesMap] = useState<Record<string, SeriesMeta>>({})
  const [seriesTarget, setSeriesTarget] = useState<{ seriesId?: string; customerId: string; serviceId: string; time: string; price: number; notes: string | null } | null>(null)
  const [estimatedEndDate, setEstimatedEndDate] = useState('')
  const [seriesRanges, setSeriesRanges] = useState<Record<string, { start: number; end: number; color: string }>>({})
  const [seriesLabels, setSeriesLabels] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAppointments()
  }, [currentDate])

  const fetchAppointments = async () => {
    try {
      const rows = await getAppointmentsForCalendar()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const filtered = (rows || []).filter((r: any) => {
        const d = new Date(r.appointment_date)
        const ds = new Date(`${d.toISOString().slice(0,10)}T00:00:00Z`)
        return ds >= new Date(startOfMonth.toISOString().slice(0,10)) && ds <= new Date(endOfMonth.toISOString().slice(0,10))
      }) as any
      setAppointments(filtered)
      const ids = Array.from(new Set(filtered.map((r: any) => r.series_id).filter(Boolean))) as string[]
      setSeriesMap({})
      const palette = ['bg-indigo-300','bg-purple-300','bg-pink-300','bg-teal-300','bg-blue-300','bg-orange-300','bg-lime-300','bg-rose-300']
      const ranges: Record<string, { start: number; end: number; color: string }> = {}
      const customerIds = Array.from(new Set(rows.map(r => r.customer_id)))
      const colorForCustomer: Record<string, string> = {}
      customerIds.forEach((cid, idx) => { colorForCustomer[cid] = palette[idx % palette.length] })
      ids.forEach((id) => { ranges[id] = { start: 0, end: 0, color: palette[0] } })
      rows.forEach(r => {
        if (!r.series_id) return
        const d = Number(r.appointment_date.split('-')[2])
        const cur = ranges[r.series_id] || { start: d, end: d, color: colorForCustomer[r.customer_id] || palette[0] }
        cur.start = cur.start === 0 ? d : Math.min(cur.start, d)
        cur.end = Math.max(cur.end, d)
        cur.color = colorForCustomer[r.customer_id] || cur.color
        ranges[r.series_id] = cur
      })
      setSeriesRanges(ranges)

      const labels: Record<string, string> = {}
      rows.forEach(r => {
        if (!r.series_id) return
        if (!labels[r.series_id]) labels[r.series_id] = r.customers.name || r.services.name
      })
      setSeriesLabels(labels)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      const cust = await getCustomers()
      const serv = (await getServices()).filter((s: any) => s.active)
      setCustomers(cust.map(c => ({ id: c.id, name: c.name })))
      setServices(serv.map((s: any) => ({ id: s.id, name: s.name, base_price: s.base_price, duration_minutes: s.duration_minutes })))
    })()
  }, [])

  useEffect(() => {
    const selected = services.find(s => s.id === serviceId)
    if (selected) setPrice(selected.base_price)
  }, [serviceId, services])

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getAppointmentsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.filter(appt => appt.appointment_date === dateStr)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'confirmed': 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'in-progress': 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'in_progress': 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'completed': 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100',
      'cancelled': 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
  }

  const isPastDay = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const today = new Date()
    today.setHours(0,0,0,0)
    return d < today
  }

  const availabilityBadge = (day: number) => {
    const count = getAppointmentsForDay(day).length
    const past = isPastDay(day)
    if (past) return { label: 'Indisponível', cls: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' }
    if (count === 0) return { label: 'Disponível', cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' }
    return { label: 'Agendado', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' }
  }

  const cellAvailabilityClass = (day: number) => {
    const count = getAppointmentsForDay(day).length
    const past = isPastDay(day)
    if (past) return 'border-gray-300 opacity-70'
    if (count === 0) return 'border-green-300'
    return 'border-yellow-300'
  }

  const seriesBarsForDay = (day: number) => {
    const seriesIds = Array.from(new Set(getAppointmentsForDay(day).map(a => a.series_id).filter(Boolean))) as string[]
    return seriesIds.map(id => ({ id, range: seriesRanges[id], label: seriesLabels[id] })).filter(s => s.range)
  }

  const openDayDetails = (day: number) => {
    if (isPastDay(day)) return
    setSelectedDay(day)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDay(null)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const toggleSelectionMode = () => {
    setSelectionMode((v) => !v)
    setSelectedDays([])
  }

  const toggleDaySelect = (day: number) => {
    if (isPastDay(day)) return
    setSelectedDays((prev) => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a,b) => a-b))
  }

  const openCreateForSelected = () => {
    if (selectedDays.length === 0) return
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setCustomerId('')
    setServiceId('')
    setAppointmentTime('')
    setPrice(0)
    setNotes('')
  }

  const makeDateStr = (day: number) => `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const submitSeries = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!appointmentTime || selectedDays.length === 0) return alert('Preencha os campos e selecione dias')
    setSubmitting(true)
    const seriesId = seriesTarget?.seriesId || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`)
    const startDate = makeDateStr(Math.min(...selectedDays))
    const estimatedEnd = estimatedEndDate || makeDateStr(Math.max(...selectedDays))
    if (!seriesTarget?.seriesId) {
      if (!customerId || !serviceId) {
        setSubmitting(false)
        return alert('Selecione cliente e serviço')
      }
      if (!supabase) {
        setSubmitting(false)
        return alert('Supabase não configurado')
      }
      const { error: sErr } = await supabase.from('appointment_series').insert({
        id: seriesId,
        customer_id: customerId,
        service_id: serviceId,
        start_date: startDate,
        estimated_end_date: estimatedEnd,
        status: 'in_progress',
        notes: notes || null,
      })
      if (sErr) {
        setSubmitting(false)
        return alert('Erro ao criar série')
      }
    } else {
      
    }

    for (const day of selectedDays) {
      try {
        await createAppointment({
          customer_id: seriesTarget?.customerId || customerId,
          service_id: seriesTarget?.serviceId || serviceId,
          appointment_date: makeDateStr(day),
          appointment_time: seriesTarget?.time || appointmentTime,
          status: 'scheduled',
          price: seriesTarget?.price ?? price,
          notes: seriesTarget?.notes ?? (notes || null),
        } as any)
      } catch (error) {
        setSubmitting(false)
        return alert('Erro ao salvar agendamento')
      }
    }
    setSubmitting(false)
    alert('Agendamentos criados com sucesso')
    setSelectedDays([])
    setShowCreateModal(false)
    setSeriesTarget(null)
    setEstimatedEndDate('')
    fetchAppointments()
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3 flex items-center gap-3">
        <span className="text-sm text-gray-700 dark:text-gray-300">Legenda:</span>
        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Disponível</span>
        <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Agendado</span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">Indisponível</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleSelectionMode}
            className={`px-3 py-1.5 rounded border text-sm ${selectionMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
          >
            {selectionMode ? 'Selecionando dias' : 'Selecionar dias'}
          </button>
          <button
            onClick={() => setSelectedDays([])}
            className="px-3 py-1.5 rounded border text-sm bg-white text-gray-700 border-gray-300"
          >
            Limpar seleção
          </button>
          <button
            onClick={openCreateForSelected}
            disabled={!selectionMode || selectedDays.length === 0}
            className={`px-3 py-1.5 rounded border text-sm ${selectedDays.length > 0 && selectionMode ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-200'}`}
          >
            Agendar selecionados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 dark:bg-gray-900 p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {day}
          </div>
        ))}
        
        {getDaysInMonth().map((day, index) => {
          const dayAppointments = day ? getAppointmentsForDay(day) : []
          
          return (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 p-2 min-h-24 border ${
                day ? `${cellAvailabilityClass(day)} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer` : 'border-gray-100 dark:border-gray-700'
              }`}
              onClick={() => {
                if (!day) return
                if (selectionMode) toggleDaySelect(day)
                else openDayDetails(day)
              }}
            >
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {day}
                  </div>
                  <div className="absolute top-2 right-2">
                    {(() => {
                      const b = availabilityBadge(day)
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.cls}`}>{b.label}</span>
                      )
                    })()}
                  </div>
                  <div className={`space-y-1 ${selectedDays.includes(day) ? 'ring-2 ring-blue-400 rounded p-1' : ''}`}
                  >
                    {seriesBarsForDay(day).slice(0,2).map((s, i) => (
                      <div
                        key={`${s.id}-${i}`}
                        className={`h-4 ${s.range.color} flex items-center px-1 text-[10px] text-gray-900 dark:text-gray-100 ${day === s.range.start ? 'rounded-l-full' : ''} ${day === s.range.end ? 'rounded-r-full' : ''}`}
                      >
                        <span className="truncate">{s.label}</span>
                      </div>
                    ))}
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`text-xs px-1 py-0.5 rounded ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-medium truncate">{appointment.customers.name}</div>
                        <div className="truncate">{appointment.appointment_time}</div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {showModal && selectedDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {`Detalhes do dia ${String(selectedDay).padStart(2,'0')}/${String(currentDate.getMonth()+1).padStart(2,'0')}/${currentDate.getFullYear()}`}
              </h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={closeModal}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const list = getAppointmentsForDay(selectedDay)
                if (list.length === 0) {
                  return (
                    <div className="text-gray-700 dark:text-gray-200">Nenhum agendamento — Disponível</div>
                  )
                }
                return (
                  <ul className="space-y-3">
                    {list.map((a) => (
                      <li key={a.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a.customers.name}</div>
                          <span className={`text-[11px] px-2 py-0.5 rounded ${getStatusColor(a.status)}`}>{a.status}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <div><span className="font-medium">Hora:</span> {a.appointment_time}</div>
                          <div><span className="font-medium">Serviço:</span> {a.services.name}</div>
                          <div><span className="font-medium">Duração:</span> {a.services.duration_minutes} min</div>
                          <div><span className="font-medium">Preço:</span> R$ {a.price.toFixed(2)}</div>
                          <div><span className="font-medium">Telefone:</span> {a.customers.phone}</div>
                          <div><span className="font-medium">Email:</span> {a.customers.email}</div>
                        </div>
                        {a.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Observações:</span> {a.notes}</div>
                        )}
                        {a.series_id && seriesMap[a.series_id] && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-200"><span className="font-medium">Est. término:</span> {new Date(seriesMap[a.series_id].estimated_end_date || a.appointment_date).toLocaleDateString('pt-BR')}</div>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            className="px-3 py-1.5 rounded border text-sm bg-white text-gray-700 border-gray-300"
                            onClick={async () => {
                              let sid = a.series_id
                              if (!sid) {
                                sid = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Date.now()}-${Math.random()}`
                                if (!supabase) {
                                  alert('Supabase não configurado')
                                  return
                                }
                                await supabase.from('appointment_series').insert({
                                  id: sid,
                                  customer_id: a.customer_id,
                                  service_id: a.service_id,
                                  start_date: a.appointment_date,
                                  status: 'in_progress',
                                  notes: a.notes,
                                })
                                await supabase.from('appointments').update({ series_id: sid }).eq('id', a.id)
                              }
                              setSeriesTarget({ seriesId: sid || undefined, customerId: a.customer_id, serviceId: a.service_id, time: a.appointment_time, price: a.price, notes: a.notes })
                              setSelectionMode(true)
                              setShowModal(false)
                            }}
                          >
                            Adicionar dias à obra
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreateModal}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agendar {selectedDays.length} dia(s)</h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={closeCreateModal}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitSeries} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Cliente</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Serviço</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Hora</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Estimativa de término</label>
                <input
                  type="date"
                  value={estimatedEndDate}
                  onChange={(e) => setEstimatedEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {submitting ? 'Salvando...' : 'Salvar agendamentos'}
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
