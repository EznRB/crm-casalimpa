'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // noop: podemos adicionar telemetria aqui caso necessário
  }, [error])
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold text-red-600 mb-2">Ocorreu um erro</h2>
      <p className="text-gray-600 mb-4">{error?.message || 'Erro inesperado'}</p>
      <div className="flex gap-2">
        <button onClick={() => reset()} className="bg-blue-600 text-white px-4 py-2 rounded">Tentar novamente</button>
        <button onClick={() => location.reload()} className="bg-gray-200 px-4 py-2 rounded">Recarregar página</button>
      </div>
    </div>
  )
}

