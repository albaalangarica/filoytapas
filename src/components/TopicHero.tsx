import Link from 'next/link'
import { longDate, relativeLabel } from '@/lib/domain/dates'
import type { TopicSummary } from '@/lib/view'
import { AvatarStack } from './Avatar'
import { Icon } from './Icon'
import { Jarra } from './Logo'
import { RsvpButtons } from './RsvpButtons'

/** El jueves que viene, en grande. */
export function TopicHero({ summary, today, mapsUrl }: { summary: TopicSummary; today: string; mapsUrl: string }) {
  const { topic, going, notGoing, myAnswer } = summary
  return (
    <section className="relative -mx-4 overflow-hidden bg-cobalt px-5 pb-6 pt-6 text-white sm:mx-0 sm:mt-4 sm:rounded-[1.75rem]">
      <Jarra className="pointer-events-none absolute -right-8 -top-4 size-48 text-white/10" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffc9a3]">
          {relativeLabel(topic.fecha, today)} · {longDate(topic.fecha)}
        </p>
        <h1 className="mt-2 text-[2.1rem] font-extrabold leading-[1.02] tracking-tight">{topic.titulo}</h1>
        {topic.cita ? <p className="mt-3 text-base italic text-cobalt-100">«{topic.cita}»</p> : null}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <Icon name="clock" className="size-4" /> {topic.hora}
          </span>
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 underline-offset-2 hover:underline">
              <Icon name="pin" className="size-4" /> {topic.lugar}
            </a>
          ) : (
            <span className="flex items-center gap-1.5">
              <Icon name="pin" className="size-4" /> {topic.lugar}
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-6">
        <p className="mb-3 font-display text-lg font-bold">{topic.llamada || '¿Contamos contigo?'}</p>
        <RsvpButtons temaId={topic.id} myAnswer={myAnswer} onDark />
      </div>

      <Link
        href={`/jueves/${encodeURIComponent(topic.id)}?tab=asistentes`}
        className="relative mt-5 flex items-center gap-3 text-sm font-semibold text-cobalt-100 hover:text-white"
      >
        {going.length > 0 ? <AvatarStack people={going} /> : null}
        <span>
          {going.length} {going.length === 1 ? 'va' : 'van'} · {notGoing.length} no {notGoing.length === 1 ? 'puede' : 'pueden'}
        </span>
      </Link>
    </section>
  )
}
