import Link from 'next/link'
import { Questions } from '@/components/Questions'
import { TopicCard } from '@/components/TopicCard'
import { TopicHero } from '@/components/TopicHero'
import { Empty, SectionTitle, TextLink, buttonStyles } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { todayInMadrid } from '@/lib/domain/dates'
import { upcomingTopic } from '@/lib/domain/model'
import { summarize, visibleTopics } from '@/lib/view'

export default async function HomePage() {
  const me = await requireUser()
  const data = await getAppData()
  const today = todayInMadrid()
  const next = upcomingTopic(data.topics, today)
  const past = visibleTopics(data, false)
    .filter((t) => t.fecha < today)
    .slice(0, 3)

  return (
    <>
      {next ? (
        <>
          <TopicHero summary={summarize(data, next, me.usuario)} today={today} mapsUrl={data.config.mapsUrl} />
          {next.preguntas.length > 0 ? (
            <>
              <SectionTitle action={<TextLink href={`/jueves/${encodeURIComponent(next.id)}`}>Leer el tema →</TextLink>}>
                Para ir pensando
              </SectionTitle>
              <Questions questions={next.preguntas.slice(0, 2)} />
            </>
          ) : null}
        </>
      ) : (
        <div className="pt-6">
          <Empty title="Todavía no hay tema para el próximo jueves">
            {me.rol === 'admin' ? (
              <Link href="/admin/temas/nuevo" className={`${buttonStyles.primary} mt-4`}>
                Publicar el tema
              </Link>
            ) : (
              'Martina y Juanma lo están cocinando. 🍳'
            )}
          </Empty>
        </div>
      )}

      {past.length > 0 ? (
        <>
          <SectionTitle action={<TextLink href="/jueves">Ver todos</TextLink>}>Anteriores</SectionTitle>
          <div className="flex flex-col gap-3">
            {past.map((t) => (
              <TopicCard key={t.id} summary={summarize(data, t, me.usuario)} />
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}
