import Link from 'next/link'
import { longDate, relativeLabel } from '@/lib/domain/dates'
import type { TopicSummary } from '@/lib/view'
import { AddToCalendar } from './AddToCalendar'
import { AvatarStack } from './Avatar'
import { Icon } from './Icon'
import { Jarra } from './Logo'
import { Questions } from './Questions'
import { RsvpButtons } from './RsvpButtons'

/** La sesión de hoy (o la próxima) entera: texto, preguntas, podcast y, al final, Voy / No puedo. */
export function SessionToday({
  summary,
  today,
  mapsUrl,
  podcastUrl,
  origin,
}: {
  summary: TopicSummary
  today: string
  mapsUrl: string
  podcastUrl: string
  origin: string
}) {
  const { topic, going, notGoing, myAnswer } = summary
  const paragraphs = topic.introduccion.split(/\n\s*\n/).filter(Boolean)
  return (
    <article className="flex flex-col gap-6">
      <header className="relative -mx-4 overflow-hidden bg-gradient-to-b from-cobalt-50 to-paper px-5 pb-2 pt-6 sm:mx-0 sm:rounded-[1.75rem] sm:pb-6">
        <Jarra className="pointer-events-none absolute -right-6 -top-3 size-40 text-cobalt/10" />
        <p className="relative inline-flex rounded-full bg-mandarin px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
          {relativeLabel(topic.fecha, today)} · {longDate(topic.fecha)}
        </p>
        <h1 className="relative mt-3 text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-navy">{topic.titulo}</h1>
        {topic.cita ? <p className="relative mt-3 text-xl italic text-cobalt-700">«{topic.cita}»</p> : null}
        <div className="relative mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_1px_0_var(--color-line)]">
            <Icon name="clock" className="size-4 text-cobalt" /> {topic.hora}
          </span>
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_1px_0_var(--color-line)] hover:text-cobalt">
              <Icon name="pin" className="size-4 text-cobalt" /> {topic.lugar}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_1px_0_var(--color-line)]">
              <Icon name="pin" className="size-4 text-cobalt" /> {topic.lugar}
            </span>
          )}
        </div>
      </header>

      {paragraphs.length > 0 ? (
        <div className="flex flex-col gap-3 text-[1.06rem] leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {topic.preguntas.length > 0 ? (
        <section>
          <h2 className="mb-3 font-display text-xl font-extrabold text-navy">Para charlar</h2>
          <Questions questions={topic.preguntas} />
        </section>
      ) : null}

      {podcastUrl ? (
        <a
          href={podcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition hover:border-cobalt"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cobalt-50 text-2xl" aria-hidden="true">
            🎧
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-extrabold text-navy">Escucha el podcast</span>
            <span className="text-sm text-muted">Y los materiales de la sesión</span>
          </span>
          <Icon name="external" className="size-5 text-cobalt" />
        </a>
      ) : null}

      <section className="rounded-card border border-cobalt-100 bg-cobalt-50 p-5">
        <p className="mb-4 font-display text-xl font-extrabold text-navy">{topic.llamada || '¿Contamos contigo?'}</p>
        <RsvpButtons temaId={topic.id} myAnswer={myAnswer} />
        <AddToCalendar topic={topic} origin={origin} />
        <Link
          href={`/sesiones/${encodeURIComponent(topic.id)}?tab=asistentes`}
          className="mt-4 flex items-center gap-3 text-sm font-semibold text-muted hover:text-ink"
        >
          {going.length > 0 ? <AvatarStack people={going} /> : null}
          <span>
            {going.length} {going.length === 1 ? 'va' : 'van'} · {notGoing.length} no {notGoing.length === 1 ? 'puede' : 'pueden'}
          </span>
        </Link>
      </section>
    </article>
  )
}
