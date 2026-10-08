'use client'

import { buttonStyles } from '@/components/ui'

export default function AuthError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold">Algo ha fallado</h1>
      <p className="text-muted">No hemos podido completar la operación. Prueba otra vez en unos segundos.</p>
      <button type="button" onClick={reset} className={buttonStyles.primary}>
        Reintentar
      </button>
    </div>
  )
}
