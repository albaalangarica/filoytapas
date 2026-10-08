'use client'

import { useEffect, useState } from 'react'
import { buttonStyles } from './ui'

interface InstallPrompt extends Event {
  prompt: () => Promise<void>
}

export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [ios, setIos] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as InstallPrompt)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detección del navegador solo posible en cliente
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (installed) return <p className="text-sm text-muted">Ya tienes la app instalada. ✨</p>
  if (prompt) {
    return (
      <button type="button" className={buttonStyles.secondary} onClick={() => prompt.prompt()}>
        Instalar en el móvil
      </button>
    )
  }
  return (
    <p className="text-sm text-muted">
      {ios
        ? 'En iPhone: pulsa Compartir en Safari y luego «Añadir a pantalla de inicio».'
        : 'Desde el menú del navegador, elige «Instalar app» o «Añadir a pantalla de inicio».'}
    </p>
  )
}
