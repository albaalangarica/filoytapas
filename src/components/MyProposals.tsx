import type { Proposal } from '@/lib/domain/model'
import { cn } from './ui'

const STATE = {
  nueva: { label: 'Recibida', className: 'bg-cobalt-50 text-cobalt-700' },
  usada: { label: '¡Elegida! 🎉', className: 'bg-ok-50 text-ok' },
  archivada: { label: 'Guardada para más adelante', className: 'bg-mist text-muted' },
} as const

export function MyProposals({ proposals }: { proposals: Proposal[] }) {
  if (proposals.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {proposals.map((p) => (
        <li key={p.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3">
          <span className="min-w-0 flex-1 font-semibold">{p.titulo}</span>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-bold', STATE[p.estado].className)}>{STATE[p.estado].label}</span>
        </li>
      ))}
    </ul>
  )
}
