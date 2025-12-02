'use client'

import { useEffect, useRef, useState } from 'react'

export default function QRTestPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [status, setStatus] = useState('Inicializando câmera...')
  const [error, setError] = useState<string | null>(null)
  const [qrText, setQrText] = useState<string | null>(null)

  useEffect(() => {
    const start = async () => {
      try {
        setStatus('Solicitando permissão da câmera')
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setStatus('Câmera ativa')

        // QR via BarcodeDetector (quando disponível)
        const hasDetector = 'BarcodeDetector' in window
        if (hasDetector) {
          // @ts-ignore
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
          const scan = async () => {
            try {
              const v = videoRef.current
              if (!v) return
              const canvas = document.createElement('canvas')
              canvas.width = v.videoWidth
              canvas.height = v.videoHeight
              const ctx = canvas.getContext('2d')
              if (!ctx) return
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
              const bitmap = await createImageBitmap(canvas)
              const codes = await detector.detect(bitmap)
              if (codes && codes.length > 0) {
                setQrText(codes[0].rawValue || 'QR detectado')
              }
            } catch {}
            requestAnimationFrame(scan)
          }
          requestAnimationFrame(scan)
        } else {
          setStatus('Leitor de QR não disponível; usando somente câmera')
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao acessar câmera')
        setStatus('')
      }
    }
    start()
    return () => {
      const v = videoRef.current
      const stream = v && (v.srcObject as MediaStream | null)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Teste de Câmera/QR</h1>
      {status && <div className="text-sm text-gray-600">{status}</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <video ref={videoRef} className="w-full max-w-md rounded border" muted playsInline />
      <div className="text-sm">
        {qrText ? (
          <span className="text-green-700">QR: {qrText}</span>
        ) : (
          <span className="text-gray-500">Aponte para um QR para testar</span>
        )}
      </div>
    </div>
  )
}
