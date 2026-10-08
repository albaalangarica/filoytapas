import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { TopicCard } from '@/components/TopicCard'
import { Empty, PageTitle, SectionTitle, buttonStyles } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { todayInMadrid } from '@/lib/domain/dates'
import { summarize, visibleTopics } from '@/lib/view'

export const metadata: Metadata = { title: 'Sesiones' }

export default async function SessionsPage() {
  const me = await requireUser()
  const data = await getAppData()
  const today = todayInMadrid()
  const isAdmin = me.rol === 'admin'
  const topics = visibleTopics(data, isAdmin)
  const past = topics.filter((t) => t.fecha < today)
  // Los admins ven también los borradores y sesiones futuras para poder editarlas.
  const upcomingDrafts = isAdmin ? topics.filter((t) => t.fecha >= today).reverse() : []

  return (
    <>
      <PageTitle eyebrow="Lo que ya hemos charlado" title="Sesiones anteriores">
        {past.length} {past.length === 1 ? 'tema' : 'temas'} hasta ahora.
      </PageTitle>

      {isAdmin ? (
        <>
          <Link href="/admin/temas/nuevo" className={`${buttonStyles.primary} w-full`}>
            <Icon name="plus" /> Nueva sesión
          </Link>
          {upcomingDrafts.length > 0 ? (
            <>
              <SectionTitle>Próximas (solo admins)</SectionTitle>
              <div className="flex flex-col gap-3">
                {upcomingDrafts.map((t) => (
                  <TopicCard key={t.id} summary={summarize(data, t, me.usuario)} upcoming />
                ))}
              </div>
              <SectionTitle>Anteriores</SectionTitle>
            </>
          ) : (
            <div className="h-4" />
          )}
        </>
      ) : null}

      {past.length > 0 ? (
        <div className="flex flex-col gap-3">
          {past.map((t) => (
            <TopicCard key={t.id} summary={summarize(data, t, me.usuario)} />
          ))}
        </div>
      ) : (
        <Empty title="Aún no hay sesiones anteriores">Aquí irán apareciendo todos los temas.</Empty>
      )}
    </>
  )
}
