import Link from 'next/link'
import { longDate, relativeLabel } from '@/lib/domain/dates'
import type { TopicSummary } from '@/lib/view'
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
}: {
  summary: TopicSummary
  today: string
  mapsUrl: string
  podcastUrl: string
}) {
  const { topic, going, notGoing, myAnswer } = summary
  const paragraphs = topic.introduccion.split(/\n\s*\n/).filter(Boolean)
  return (
    <article className="flex flex-col gap-6 pt-6">
      <header className="relative">
        <Jarra className="pointer-events-none absolute -right-3 -top-2 size-28 text-terra/10" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-terra-700">
          {relativeLabel(topic.fecha, today)} · {longDate(topic.fecha)}
        </p>
        <h1 className="relative mt-2 text-[2.15rem] font-semibold leading-[1.05] tracking-tight text-cacao">{topic.titulo}</h1>
        {topic.cita ? <p className="mt-3 font-display text-xl italic text-oliva-700">«{topic.cita}»</p> : null}
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5">
            <Icon name="clock" className="size-4 text-terra" /> {topic.hora}
          </span>
          {mapsUrl ? (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 hover:bg-terra-50">
              <Icon name="pin" className="size-4 text-terra" /> {topic.lugar}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5">
              <Icon name="pin" className="size-4 text-terra" /> {topic.lugar}
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
          <h2 className="mb-3 font-display text-xl font-semibold text-cacao">Para charlar</h2>
          <Questions questions={topic.preguntas} />
        </section>
      ) : null}

      {podcastUrl ? (
        <a
          href={podcastUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition hover:border-terra"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-terra-50 text-2xl" aria-hidden="true">
            🎧
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-semibold text-cacao">Escucha el podcast</span>
            <span className="text-sm text-muted">Y los materiales de la sesión</span>
          </span>
          <Icon name="external" className="size-5 text-terra" />
        </a>
      ) : null}

      <section className="rounded-card bg-mist p-5">
        <p className="mb-4 font-display text-xl font-semibold text-cacao">{topic.llamada || '¿Contamos contigo?'}</p>
        <RsvpButtons temaId={topic.id} myAnswer={myAnswer} />
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
