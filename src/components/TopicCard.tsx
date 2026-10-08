import Link from 'next/link'
import { dayAndMonth } from '@/lib/domain/dates'
import type { TopicSummary } from '@/lib/view'
import { cn } from './ui'

/** Una tarjeta por sesión. */
export function TopicCard({ summary, highlight = false, upcoming = false }: { summary: TopicSummary; highlight?: boolean; upcoming?: boolean }) {
  const { topic, going, reflections } = summary
  const { day, month } = dayAndMonth(topic.fecha)
  return (
    <Link
      href={`/sesiones/${encodeURIComponent(topic.id)}`}
      className={cn(
        'group grid grid-cols-[auto_1fr] items-center gap-4 rounded-card border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-16px_rgba(126,85,57,0.45)]',
        highlight ? 'border-2 border-mandarin' : 'border-line',
      )}
    >
      <div className="w-14 rounded-2xl border border-mandarin/20 bg-mandarin-50 py-2 text-center leading-none text-mandarin-700">
        <span className="block font-display text-2xl font-extrabold">{day}</span>
        <span className="text-[10px] font-bold tracking-[0.12em]">{month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-extrabold leading-tight text-navy group-hover:text-mandarin-700">{topic.titulo}</h3>
        {topic.cita ? <p className="mt-0.5 truncate text-sm italic text-muted">«{topic.cita}»</p> : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
          <span>
            🔥 {going.length} {upcoming ? (going.length === 1 ? 'va' : 'van') : going.length === 1 ? 'fue' : 'fueron'}
          </span>
          <span>💬 {reflections.length} {reflections.length === 1 ? 'aportación' : 'aportaciones'}</span>
          {!topic.publicado ? <span className="rounded-full bg-cobalt-50 px-2 text-cobalt-700">Borrador</span> : null}
        </div>
      </div>
    </Link>
  )
}
