import { formatEuros } from '@/lib/domain/money'
import { cn } from './ui'

/** Lo que le toca pagar a la persona de una sesión. */
export function MyDebt({ importe, pagado }: { importe: number; pagado: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-card border p-4', pagado ? 'border-ok/30 bg-ok-50' : 'border-mandarin/30 bg-mandarin-50')}>
      <span className="text-2xl" aria-hidden="true">
        {pagado ? '✅' : '🧾'}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-muted">Tu parte de la cuenta</p>
        <p className="font-display text-2xl font-extrabold tabular-nums text-navy">{formatEuros(importe)}</p>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', pagado ? 'bg-ok text-white' : 'bg-mandarin text-white')}>
        {pagado ? 'Pagado' : 'Pendiente'}
      </span>
    </div>
  )
}
