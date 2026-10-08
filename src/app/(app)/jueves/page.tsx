import type { Metadata } from 'next'
import Link from 'next/link'
import { TopicCard } from '@/components/TopicCard'
import { Icon } from '@/components/Icon'
import { Empty, PageTitle, SectionTitle, buttonStyles } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { todayInMadrid } from '@/lib/domain/dates'
import { summarize, visibleTopics } from '@/lib/view'

export const metadata: Metadata = { title: 'Jueves' }

export default async function TopicsPage() {
  const me = await requireUser()
  const data = await getAppData()
  const today = todayInMadrid()
  const topics = visibleTopics(data, me.rol === 'admin')
  const upcoming = topics.filter((t) => t.fecha >= today).reverse()
  const past = topics.filter((t) => t.fecha < today)

  return (
    <>
      <PageTitle eyebrow="Una tarjeta por convocatoria" title="Los jueves">
        {past.length} {past.length === 1 ? 'tema charlado' : 'temas charlados'} hasta ahora.
      </PageTitle>
      {me.rol === 'admin' ? (
        <Link href="/admin/temas/nuevo" className={`${buttonStyles.primary} mb-2 w-full`}>
          <Icon name="plus" /> Nuevo tema
        </Link>
      ) : null}

      {upcoming.length > 0 ? (
        <>
          <SectionTitle>Próximo</SectionTitle>
          <div className="flex flex-col gap-3">
            {upcoming.map((t, i) => (
              <TopicCard key={t.id} summary={summarize(data, t, me.usuario)} highlight={i === 0 && t.publicado} />
            ))}
          </div>
        </>
      ) : null}

      <SectionTitle>Pasados</SectionTitle>
      {past.length > 0 ? (
        <div className="flex flex-col gap-3">
          {past.map((t) => (
            <TopicCard key={t.id} summary={summarize(data, t, me.usuario)} />
          ))}
        </div>
      ) : (
        <Empty title="Aún no hay temas pasados">Aquí irán apareciendo todos los jueves.</Empty>
      )}
    </>
  )
}
