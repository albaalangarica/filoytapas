import { googleCalendarUrl } from '@/lib/domain/ics'
import type { Topic } from '@/lib/domain/model'

/** Añadir la sesión a Apple Calendar (archivo .ics) o a Google Calendar. */
export function AddToCalendar({ topic, origin }: { topic: Topic; origin: string }) {
  const path = `/sesiones/${encodeURIComponent(topic.id)}`
  const pill =
    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cobalt/25 bg-white px-3 py-2.5 text-sm font-bold text-cobalt-700 transition hover:bg-cobalt-50'
  return (
    <div className="mt-4 border-t border-cobalt-100 pt-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">📅 Añadir al calendario</p>
      <div className="flex gap-2">
        <a href={`${path}/ics`} className={pill}>
          Apple / iPhone
        </a>
        <a href={googleCalendarUrl(topic, `${origin}${path}`)} target="_blank" rel="noopener noreferrer" className={pill}>
          Google Calendar
        </a>
      </div>
    </div>
  )
}
