import type { Metadata } from 'next'
import Link from 'next/link'
import { AddReflection } from '@/components/ReflectionForm'
import { ReflectionList } from '@/components/ReflectionList'
import { Empty, PageTitle } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { longDate } from '@/lib/domain/dates'
import { isOpenForContributions } from '@/lib/domain/model'
import { summarize } from '@/lib/view'

export const metadata: Metadata = { title: 'Aportaciones' }

export default async function ContributionsPage() {
  const me = await requireUser()
  const data = await getAppData()
  // Solo sesiones que ya han empezado: las aportaciones son de después.
  const topics = data.topics.filter((t) => isOpenForContributions(t))
  const isAdmin = me.rol === 'admin'

  return (
    <>
      <PageTitle eyebrow="Lo que nos llevamos de cada sesión" title="Aportaciones">
        Escribe lo que te llevas de cada tema. Lo lee todo el grupo.
      </PageTitle>
      {topics.length === 0 ? (
        <Empty title="Aún no hay sesiones celebradas">Las aportaciones se abren cuando empieza cada sesión.</Empty>
      ) : (
        <div className="flex flex-col gap-10">
          {topics.map((topic) => {
            const { reflections } = summarize(data, topic, me.usuario)
            return (
              <section key={topic.id} aria-labelledby={`t-${topic.id}`} className="flex flex-col gap-3">
                <header className="border-b-2 border-dotted border-terra/30 pb-2">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-terra-700">{longDate(topic.fecha)}</p>
                  <h2 id={`t-${topic.id}`} className="font-display text-2xl font-semibold leading-tight text-cacao">
                    <Link href={`/sesiones/${encodeURIComponent(topic.id)}`} className="hover:text-terra-700">
                      {topic.titulo}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted">
                    {reflections.length} {reflections.length === 1 ? 'aportación' : 'aportaciones'}
                  </p>
                </header>
                {reflections.length > 0 ? <ReflectionList reflections={reflections} me={me.usuario} isAdmin={isAdmin} /> : null}
                <AddReflection temaId={topic.id} compact={reflections.length > 0} />
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
