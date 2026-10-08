import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Attendees } from '@/components/Attendees'
import { Icon } from '@/components/Icon'
import { Questions } from '@/components/Questions'
import { AddReflection } from '@/components/ReflectionForm'
import { ReflectionItem } from '@/components/ReflectionItem'
import { RsvpButtons } from '@/components/RsvpButtons'
import { ShareButton } from '@/components/ShareButton'
import { Empty, Eyebrow, buttonStyles, cn } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { longDate, relativeLabel, todayInMadrid } from '@/lib/domain/dates'
import { isOpenForRsvp } from '@/lib/domain/model'
import { shareText } from '@/lib/share'
import { summarize } from '@/lib/view'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }

const TABS = [
  { id: 'tema', label: 'Tema' },
  { id: 'asistentes', label: 'Asistentes' },
  { id: 'reflexiones', label: 'Reflexiones' },
] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const topic = (await getAppData()).topics.find((t) => t.id === decodeURIComponent(id))
  return { title: topic?.titulo ?? 'Jueves' }
}

export default async function TopicPage({ params, searchParams }: Props) {
  const me = await requireUser()
  const { id } = await params
  const { tab: tabParam } = await searchParams
  const data = await getAppData()
  const topic = data.topics.find((t) => t.id === decodeURIComponent(id))
  if (!topic || (!topic.publicado && me.rol !== 'admin')) notFound()

  const today = todayInMadrid()
  const summary = summarize(data, topic, me.usuario)
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? 'tema'
  const open = isOpenForRsvp(topic, today)
  const isAdmin = me.rol === 'admin'
  const counts = { tema: null, asistentes: summary.going.length, reflexiones: summary.reflections.length }
  const paragraphs = topic.introduccion.split(/\n\s*\n/).filter(Boolean)

  return (
    <article className="pt-4">
      <Link href="/jueves" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-cobalt">
        <Icon name="back" className="size-4" /> Todos los jueves
      </Link>

      <header>
        <Eyebrow>
          {topic.fecha >= today ? `${relativeLabel(topic.fecha, today)} · ` : ''}
          {longDate(topic.fecha)} · {topic.hora} · {topic.lugar}
        </Eyebrow>
        <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.04] tracking-tight">{topic.titulo}</h1>
        {topic.cita ? <p className="mt-3 border-l-4 border-cobalt pl-3 text-lg italic text-muted">«{topic.cita}»</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          {topic.autor ? <span>Por {topic.autor}</span> : null}
          {!topic.publicado ? <span className="rounded-full bg-cobalt-50 px-2.5 py-0.5 font-bold text-cobalt">Borrador: solo lo ven los admins</span> : null}
        </div>
      </header>

      {open ? (
        <div className="mt-5 rounded-card bg-mist p-4">
          <p className="mb-3 font-display text-lg font-bold">{topic.llamada || '¿Contamos contigo?'}</p>
          <RsvpButtons temaId={topic.id} myAnswer={summary.myAnswer} />
        </div>
      ) : null}

      <nav aria-label="Secciones" className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 mt-6 border-b border-line bg-paper/95 px-4 backdrop-blur">
        <ul className="flex gap-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`?tab=${t.id}`}
                replace
                scroll={false}
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 border-b-[3px] px-3 py-3 text-sm font-bold',
                  tab === t.id ? 'border-mandarin text-ink' : 'border-transparent text-muted',
                )}
              >
                {t.label}
                {counts[t.id] !== null ? (
                  <span className={cn('rounded-full px-1.5 text-xs', tab === t.id ? 'bg-mandarin-50 text-mandarin-700' : 'bg-mist')}>{counts[t.id]}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-6">
        {tab === 'tema' ? (
          <div className="flex flex-col gap-6">
            {paragraphs.length > 0 ? (
              <div className="flex flex-col gap-3 text-[1.05rem] leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            ) : null}
            {topic.preguntas.length > 0 ? (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">Las preguntas</h2>
                <Questions questions={topic.preguntas} />
              </section>
            ) : null}
            <div className="flex flex-col gap-2">
              {topic.materialesUrl ? (
                <a href={topic.materialesUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
                  <Icon name="folder" /> Materiales de este jueves
                </a>
              ) : null}
              <ShareButton text={shareText(topic)} path={`/jueves/${encodeURIComponent(topic.id)}`} />
              {isAdmin ? (
                <Link href={`/admin/temas/${encodeURIComponent(topic.id)}/editar`} className={buttonStyles.ghost}>
                  <Icon name="edit" /> Editar tema
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === 'asistentes' ? <Attendees going={summary.going} notGoing={summary.notGoing} /> : null}

        {tab === 'reflexiones' ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted">Lo que nos dejó pensando: artículos, notas, hilos o audios de cada uno.</p>
            <AddReflection temaId={topic.id} />
            {summary.reflections.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {summary.reflections.map((r) => (
                  <ReflectionItem
                    key={r.id}
                    id={r.id}
                    titulo={r.titulo}
                    url={r.url}
                    usuario={r.usuario}
                    nombre={r.nombre}
                    canEdit={r.usuario === me.usuario}
                    canDelete={r.usuario === me.usuario || isAdmin}
                  />
                ))}
              </ul>
            ) : (
              <Empty title="Aún no hay reflexiones">¿Te animas a dejar la primera?</Empty>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
