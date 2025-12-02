'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const QrReader = dynamic(() => import('react-qr-reader').then((m: any) => m.QrReader), { ssr: false })
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), { ssr: false })

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function MobileScanPage() {
  const [ready, setReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lastText, setLastText] = useState<string | null>(null)
  const permit = useRef<boolean>(false)

  useEffect(() => {
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        s.getTracks().forEach((t) => t.stop())
        permit.current = true
        setReady(true)
      } catch (e: any) {
        setCameraError('Sem permissão de câmera. Use o botão abaixo para selecionar uma imagem com QR.')
        setReady(false)
      }
    })()
  }, [])

  const beep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      setTimeout(() => {
        o.stop()
        ctx.close()
      }, 120)
    } catch {}
  }, [])

  function parseEmployeeId(text: string): string | null {
    try {
      const obj = JSON.parse(text)
      if (obj && obj.employeeId) return String(obj.employeeId)
    } catch {}
    const m = /(employeeId|funcionarioId)\s*[:=]\s*([\w-]+)/i.exec(text)
    if (m) return String(m[2])
    const plain = text.trim()
    if (plain) return plain
    return null
  }

  async function registerPresence(id: string) {
    const body = { employeeId: id, workDate: todayStr() }
    const res = await fetch('/api/presencas/registrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('Falha ao registrar presença')
  }

  const onResult = useCallback(async (result: any, error: any) => {
    if (!!result) {
      const text = String(result?.text || '').trim()
      if (!text || text === lastText) return
      setLastText(text)
      const id = parseEmployeeId(text)
      if (!id) {
        toast.error('QR inválido')
        return
      }
      try {
        await registerPresence(id)
        beep()
        toast.success('Presença registrada')
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao registrar')
      }
    }
    if (error) {
      // manter leitor ativo, informar erro breve
      // erros intermitentes são comuns durante scan; só logar leve
    }
  }, [lastText, beep])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Toaster richColors position="top-center" />
      <h1 className="text-xl font-bold mb-3">Scanner de Presença</h1>
      {cameraError && (
        <div className="mb-3 text-sm text-yellow-700 dark:text-yellow-300">{cameraError}</div>
      )}
      {ready ? (
        <div className="rounded-2xl overflow-hidden">
          {/* QrReader dinâmico */}
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={onResult}
            videoStyle={{ width: '100%' }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] h-12 w-full rounded-xl bg-gray-800 text-white text-base font-semibold"
          >
            Selecionar foto com QR
          </button>
          <div className="text-sm text-gray-500">Tente permitir a câmera nas configurações do navegador.</div>
        </div>
      )}
      <div className="mt-4">
        <button onClick={() => setLastText(null)} className="min-h-[44px] h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-700 text-base">Escanear novamente</button>
      </div>
    </div>
  )
}

