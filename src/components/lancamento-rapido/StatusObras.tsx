'use client'

import { useEffect, useState } from 'react'

type Status = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
type StatusEntry = { appointmentId: string; status: Status }

type Props = { value: StatusEntry[]; onChange: (next: StatusEntry[]) => void; date: string }

export default function StatusObras({ value, onChange, date }: Props) {
  const [jobs, setJobs] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/jobs?from=${date}&to=${date}`)
        const data = await res.json()
        setJobs(data || [])
      } catch {}
    })()
  }, [date])

  function setStatus(appId: string, status: Status) {
    const exists = value.find((v) => v.appointmentId === appId)
    let next = [...value]
    if (exists) next = next.map((v) => (v.appointmentId === appId ? { appointmentId: appId, status } : v))
    else next.push({ appointmentId: appId, status })
    onChange(next)
  }

  const statuses: Status[] = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const current = value.find((v) => v.appointmentId === job.id)?.status || job.status
        return (
          <div key={job.id} className="flex items-center gap-2">
            <div className="flex-1">{job.customers?.name || job.id}</div>
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(job.id, s)}
                  className={`px-3 py-3 rounded-xl text-sm font-semibold ${current === s ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'} active:scale-[0.98]`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
