import { cn } from './ui'

const COLORS = ['bg-cobalt', 'bg-mandarin', 'bg-sky', 'bg-navy', 'bg-[#a8763e]', 'bg-[#6f8f7a]', 'bg-[#b5654a]']

function colorFor(usuario: string): string {
  let h = 0
  for (const ch of usuario) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]!
}

export function initials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/)
  const letters = parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : nombre.slice(0, 2)
  return letters.toUpperCase()
}

export function Avatar({ usuario, nombre, size = 'md' }: { usuario: string; nombre: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      title={nombre}
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-bold text-white ring-2 ring-paper',
        colorFor(usuario),
        size === 'sm' && 'size-7 text-[10px]',
        size === 'md' && 'size-9 text-xs',
        size === 'lg' && 'size-14 text-lg',
      )}
    >
      {initials(nombre)}
    </span>
  )
}

export function AvatarStack({ people, max = 6 }: { people: { usuario: string; nombre: string }[]; max?: number }) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.usuario} usuario={p.usuario} nombre={p.nombre} size="sm" />
      ))}
      {rest > 0 ? (
        <span className="inline-grid size-7 place-items-center rounded-full bg-ink text-[10px] font-bold text-white ring-2 ring-paper">
          +{rest}
        </span>
      ) : null}
    </div>
  )
}
