'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { parseTranscript, EmployeeMeta } from '@/utils/voiceParser'

type Props = {
  onConfirm: (result: { employees: Array<{ employeeId: string; workDays: number; dailyRate: number }>; expenses: Array<{ description: string; amount: number; category?: string }> }) => void
}

export default function VoiceCapture({ onConfirm }: Props) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<{ employees: any[]; expenses: any[] }>({ employees: [], expenses: [] })
  const recRef = useRef<any>(null)
  const [employeesMeta, setEmployeesMeta] = useState<EmployeeMeta[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/employees')
        const data = await res.json()
        setEmployeesMeta((data || []).map((e: any) => ({ id: e.id, name: e.name, dailyRate: e.dailyRate })))
      } catch {}
    })()
  }, [])

  function start() {
    try {
      const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (!SR) {
        const txt = prompt('Ditado indisponível. Digite seu texto:') || ''
        if (txt.trim()) finalize(txt)
        return
      }
      const rec = new SR()
      rec.lang = 'pt-BR'
      rec.continuous = false
      rec.interimResults = true
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) setTranscript(r[0].transcript)
        }
      }
      rec.onend = () => {
        setRecording(false)
        if (transcript && transcript.trim()) finalize(transcript)
      }
      rec.onerror = () => {
        setRecording(false)
        toast.error('Erro no ditado')
      }
      recRef.current = rec
      setRecording(true)
      rec.start()
    } catch {
      setRecording(false)
    }
  }

  function finalize(text: string) {
    const parsed = parseTranscript(text, employeesMeta)
    setPreview(parsed)
    setOpen(true)
  }

  function confirm() {
    setOpen(false)
    onConfirm(preview)
    setTranscript('')
    setPreview({ employees: [], expenses: [] })
  }

  return (
    <div>
      <button
        aria-label="Ditado"
        onClick={start}
        disabled={recording}
        className="min-h-[44px] h-12 w-full rounded-xl bg-gray-800 text-white text-base font-semibold active:scale-[0.98]"
      >
        {recording ? 'Gravando…' : 'Ditado'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
          <div className="w-full sm:w-[360px] bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl p-4">
            <div className="text-lg font-semibold mb-3">Preview</div>
            <div className="space-y-3">
              <div>
                <div className="font-medium mb-1">Funcionários</div>
                {preview.employees.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhum</div>
                ) : (
                  <ul className="space-y-1">
                    {preview.employees.map((e, i) => (
                      <li key={i} className="flex justify-between text-sm"><span>{e.employeeId}</span><span>R$ {e.dailyRate}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="font-medium mb-1">Gastos</div>
                {preview.expenses.length === 0 ? (
                  <div className="text-sm text-gray-500">Nenhum</div>
                ) : (
                  <ul className="space-y-1">
                    {preview.expenses.map((g, i) => (
                      <li key={i} className="flex justify-between text-sm"><span>{g.description}</span><span>R$ {g.amount}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              {preview.employees.length === 0 && preview.expenses.length === 0 && (
                <div>
                  <div className="font-medium mb-1">Transcrição</div>
                  <textarea defaultValue={transcript} className="w-full min-h-24 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base" />
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button aria-label="Cancelar" onClick={() => setOpen(false)} className="min-h-[44px] h-12 flex-1 rounded-xl bg-gray-200 dark:bg-gray-700 text-base">Cancelar</button>
                <button aria-label="Confirmar" onClick={confirm} className="min-h-[44px] h-12 flex-1 rounded-xl bg-primary-600 text-white text-base">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

