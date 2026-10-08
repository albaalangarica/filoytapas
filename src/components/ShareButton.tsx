'use client'

import { useState } from 'react'
import { Icon } from './Icon'
import { buttonStyles, cn } from './ui'

/** Copia la convocatoria lista para pegar en el grupo de WhatsApp (o abre el menú de compartir del móvil). */
export function ShareButton({ text, path, className }: { text: string; path: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = new URL(path, window.location.origin).toString()
    const full = `${text}\n\n${url}`
    if (navigator.share) {
      try {
        await navigator.share({ text: full })
        return
      } catch {
        // Cancelado o no disponible: copiamos.
      }
    }
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Copia el texto:', full)
    }
  }

  return (
    <button type="button" onClick={share} className={cn(buttonStyles.secondary, className)}>
      <Icon name={copied ? 'copy' : 'share'} />
      {copied ? '¡Copiado! Pégalo en el grupo' : 'Compartir en WhatsApp'}
    </button>
  )
}
