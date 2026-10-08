'use client'

import { useFormStatus } from 'react-dom'
import { buttonStyles, cn } from './ui'

export function SubmitButton({
  children,
  pendingText,
  variant = 'primary',
  className,
  name,
  value,
}: {
  children: React.ReactNode
  pendingText?: string
  variant?: keyof typeof buttonStyles | 'bare'
  className?: string
  name?: string
  value?: string
}) {
  const { pending, data } = useFormStatus()
  const base = variant === 'bare' ? '' : withoutOverridden(buttonStyles[variant], className)
  // Con varios botones en el mismo formulario, solo el pulsado muestra "enviando".
  const mine = pending && (!name || data?.get(name) === value)
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={cn(base, 'disabled:cursor-wait', className)}>
      {mine && pendingText ? pendingText : children}
    </button>
  )
}

/** Quita del estilo base el relleno (px-/py-) que el className sobrescribe, para que no compitan. */
function withoutOverridden(base: string, className = ''): string {
  const overridden = ['px-', 'py-'].filter((prefix) => className.split(/\s+/).some((c) => c.startsWith(prefix)))
  return base
    .split(/\s+/)
    .filter((c) => !overridden.some((prefix) => c.startsWith(prefix)))
    .join(' ')
}
