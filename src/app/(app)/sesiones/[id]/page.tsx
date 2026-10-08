import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Attendees } from '@/components/Attendees'
import { BillForm } from '@/components/BillForm'
import { MyDebt } from '@/components/MyDebt'
import { Icon } from '@/components/Icon'
import { Questions } from '@/components/Questions'
import { AddReflection } from '@/components/ReflectionForm'
import { ReflectionList } from '@/components/ReflectionList'
import { RsvpButtons } from '@/components/RsvpButtons'
import { ShareButton } from '@/components/ShareButton'
import { Empty, Eyebrow, buttonStyles, cn } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { longDate, relativeLabel, todayInMadrid } from '@/lib/domain/dates'
import { isOpenForContributions, isOpenForRsvp } from '@/lib/domain/model'
import { shareText } from '@/lib/share'
import { summarize } from '@/lib/view'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }

const ALL_TABS = [
  { id: 'tema', label: 'Tema' },
  { id: 'asistentes', label: 'Asistentes' },
  { id: 'aportaciones', label: 'Aportaciones' },
  { id: 'cuentas', label: 'Cuentas' },
] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const topic = (await getAppData()).topics.find((t) => t.id === decodeURIComponent(id))
  return { title: topic?.titulo ?? 'Sesión' }
}

export default async function SessionPage({ params, searchParams }: Props) {
  const me = await requireUser()
  const { id } = await params
  const { tab: tabParam } = await searchParams
  const data = await getAppData()
  const topic = data.topics.find((t) => t.id === decodeURIComponent(id))
  if (!topic || (!topic.publicado && me.rol !== 'admin')) notFound()

  const today = todayInMadrid()
  const summary = summarize(data, topic, me.usuario)
  const isAdminUser = me.rol === 'admin'
  // La pestaña de cuentas solo la ven los admins; cada miembro ve su parte en «Tema».
  const TABS = ALL_TABS.filter((t) => t.id !== 'cuentas' || isAdminUser)
  const tab = TABS.find((t) => t.id === tabParam || (tabParam === 'reflexiones' && t.id === 'aportaciones'))?.id ?? 'tema'
  const isAdmin = me.rol === 'admin'
  const topicDebts = data.debts.filter((d) => d.temaId === topic.id)
  const myDebt = topicDebts.find((d) => d.usuario === me.usuario)
  const counts = { tema: null, asistentes: summary.going.length, aportaciones: summary.reflections.length, cuentas: null }
  const paragraphs = topic.introduccion.split(/\n\s*\n/).filter(Boolean)
  const podcastUrl = topic.materialesUrl || data.config.driveUrl
  const canContribute = isOpenForContributions(topic)

  return (
    <article className="pt-5">
      <Link href="/sesiones" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-terra-700">
        <Icon name="back" className="size-4" /> Sesiones
      </Link>

      <header>
        <Eyebrow>
          {topic.fecha >= today ? `${relativeLabel(topic.fecha, today)} · ` : ''}
          {longDate(topic.fecha)} · {topic.hora} · {topic.lugar}
        </Eyebrow>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1.06] tracking-tight text-cacao">{topic.titulo}</h1>
        {topic.cita ? <p className="mt-3 font-display text-lg italic text-oliva-700">«{topic.cita}»</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          {topic.autor ? <span>Por {topic.autor}</span> : null}
          {!topic.publicado ? <span className="rounded-full bg-oliva-50 px-2.5 py-0.5 font-bold text-oliva-700">Borrador: solo lo ven los admins</span> : null}
        </div>
      </header>

      <nav aria-label="Secciones" className="sticky top-[calc(4.75rem+env(safe-area-inset-top))] z-10 -mx-4 mt-5 border-b border-line bg-paper/95 px-4 backdrop-blur">
        <ul className="-mb-px flex overflow-x-auto [scrollbar-width:none]">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`?tab=${t.id}`}
                replace
                scroll={false}
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-[3px] px-2.5 py-3 text-sm font-bold',
                  tab === t.id ? 'border-terra text-ink' : 'border-transparent text-muted',
                )}
              >
                {t.label}
                {counts[t.id] !== null ? (
                  <span className={cn('rounded-full px-1.5 text-xs', tab === t.id ? 'bg-terra-50 text-terra-700' : 'bg-mist')}>{counts[t.id]}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-6">
        {tab === 'tema' ? (
          <div className="flex flex-col gap-6">
            {myDebt ? <MyDebt importe={myDebt.importe} pagado={myDebt.pagado} /> : null}
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
                <h2 className="mb-3 font-display text-xl font-semibold text-cacao">Para charlar</h2>
                <Questions questions={topic.preguntas} />
              </section>
            ) : null}
            {isOpenForRsvp(topic, today) ? (
              <div className="rounded-card bg-mist p-5">
                <p className="mb-4 font-display text-xl font-semibold text-cacao">{topic.llamada || '¿Contamos contigo?'}</p>
                <RsvpButtons temaId={topic.id} myAnswer={summary.myAnswer} />
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              {podcastUrl ? (
                <a href={podcastUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles.secondary}>
                  🎧 Escucha el podcast
                </a>
              ) : null}
              <ShareButton text={shareText(topic)} path={`/sesiones/${encodeURIComponent(topic.id)}`} />
              {isAdmin ? (
                <Link href={`/admin/temas/${encodeURIComponent(topic.id)}/editar`} className={buttonStyles.ghost}>
                  <Icon name="edit" /> Editar sesión
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === 'cuentas' && isAdmin ? (
          <BillForm
            temaId={topic.id}
            people={data.users
              .filter((u) => u.estado === 'activo' || topicDebts.some((d) => d.usuario === u.usuario))
              .map((u) => {
                const debt = topicDebts.find((d) => d.usuario === u.usuario)
                return {
                  usuario: u.usuario,
                  nombre: u.nombre,
                  went: summary.going.some((g) => g.usuario === u.usuario),
                  importe: debt?.importe ?? null,
                  pagado: debt?.pagado ?? false,
                }
              })
              .sort((a, b) => Number(b.went) - Number(a.went) || a.nombre.localeCompare(b.nombre, 'es'))}
          />
        ) : null}

        {tab === 'asistentes' ? <Attendees going={summary.going} notGoing={summary.notGoing} /> : null}

        {tab === 'aportaciones' ? (
          <div className="flex flex-col gap-4">
            {canContribute ? (
              <AddReflection temaId={topic.id} />
            ) : (
              <p className="rounded-card bg-mist p-4 text-sm text-muted">
                Las aportaciones se abren cuando empiece la sesión ({longDate(topic.fecha)}, {topic.hora}). ¡Nos vemos en la mesa!
              </p>
            )}
            {summary.reflections.length > 0 ? (
              <ReflectionList reflections={summary.reflections} me={me.usuario} isAdmin={isAdmin} />
            ) : canContribute ? (
              <Empty title="Aún no hay aportaciones">¿Te animas a dejar la primera?</Empty>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
