import Link from 'next/link'
import { dayAndMonth } from '@/lib/domain/dates'
import type { TopicSummary } from '@/lib/view'
import { cn } from './ui'

/** Una tarjeta por convocatoria. */
export function TopicCard({ summary, highlight = false }: { summary: TopicSummary; highlight?: boolean }) {
  const { topic, going, reflections } = summary
  const { day, month } = dayAndMonth(topic.fecha)
  return (
    <Link
      href={`/jueves/${encodeURIComponent(topic.id)}`}
      className={cn(
        'group grid grid-cols-[auto_1fr] items-center gap-4 rounded-card border bg-paper p-4 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(30,71,224,0.35)]',
        highlight ? 'border-mandarin border-2' : 'border-line',
      )}
    >
      <div className="w-14 rounded-2xl bg-mandarin-50 py-2 text-center leading-none text-mandarin-700">
        <span className="block font-display text-2xl font-extrabold">{day}</span>
        <span className="text-[10px] font-bold tracking-[0.12em]">{month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-extrabold leading-tight group-hover:text-cobalt">{topic.titulo}</h3>
        {topic.cita ? <p className="mt-0.5 truncate text-sm italic text-muted">«{topic.cita}»</p> : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
          <span>🔥 {going.length} {highlight ? (going.length === 1 ? 'va' : 'van') : ''}</span>
          <span>💬 {reflections.length} {reflections.length === 1 ? 'reflexión' : 'reflexiones'}</span>
          {!topic.publicado ? <span className="rounded-full bg-cobalt-50 px-2 text-cobalt">Borrador</span> : null}
        </div>
      </div>
    </Link>
  )
}
