'use client'

import { buttonStyles } from '@/components/ui'

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-5xl">🫗</p>
      <h1 className="text-2xl font-extrabold">Se nos ha derramado algo</h1>
      <p className="max-w-xs text-muted">No hemos podido cargar los datos. Prueba otra vez en unos segundos.</p>
      <button type="button" onClick={reset} className={buttonStyles.primary}>
        Reintentar
      </button>
    </div>
  )
}
