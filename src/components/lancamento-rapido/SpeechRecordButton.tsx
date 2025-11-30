'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onTranscript: (text: string) => void
  busyLabel?: string
}

export default function SpeechRecordButton({ onTranscript, busyLabel }: Props) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(false)
  const recRef = useRef<any>(null)

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) setSupported(true)
    if (SR) {
      const r = new SR()
      r.lang = 'pt-BR'
      r.continuous = false
      r.interimResults = false
      r.onresult = (e: any) => {
        const t = Array.from(e.results).map((r: any) => r[0]?.transcript || '').join(' ').trim()
        if (t) onTranscript(t)
        setRecording(false)
      }
      r.onend = () => setRecording(false)
      recRef.current = r
    }
  }, [])

  function startStop() {
    if (!supported) return
    if (recording) {
      try { recRef.current?.stop?.() } catch {}
      setRecording(false)
    } else {
      try { recRef.current?.start?.() } catch {}
      setRecording(true)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={startStop}
        disabled={!supported}
        className={`inline-flex items-center justify-center w-full rounded-xl ${recording ? 'bg-red-600' : 'bg-primary-600'} px-5 py-3 text-base font-semibold text-white shadow-sm active:scale-[0.98] disabled:bg-gray-400`}
      >
        {recording ? 'Falando… Toque para parar' : 'Falar e Registrar'}
      </button>
      {!supported && (
        <span className="text-sm text-gray-500">{busyLabel || 'Microfone indisponível'}</span>
      )}
    </div>
  )
}

