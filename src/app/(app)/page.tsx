import Link from 'next/link'
import { SessionToday } from '@/components/SessionToday'
import { Empty, TextLink, buttonStyles } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { todayInMadrid } from '@/lib/domain/dates'
import { upcomingTopic } from '@/lib/domain/model'
import { summarize } from '@/lib/view'

export default async function HomePage() {
  const me = await requireUser()
  const data = await getAppData()
  const today = todayInMadrid()
  const next = upcomingTopic(data.topics, today)

  if (!next) {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <Empty title="Todavía no hay tema para la próxima sesión">
          {me.rol === 'admin' ? (
            <Link href="/admin/temas/nuevo" className={`${buttonStyles.primary} mt-4`}>
              Publicar la sesión
            </Link>
          ) : (
            'Martina y Juanma lo están cocinando. 🫒'
          )}
        </Empty>
        <p className="text-center text-sm">
          <TextLink href="/sesiones">Ver sesiones anteriores</TextLink>
        </p>
      </div>
    )
  }

  return (
    <SessionToday
      summary={summarize(data, next, me.usuario)}
      today={today}
      mapsUrl={data.config.mapsUrl}
      podcastUrl={next.materialesUrl || data.config.driveUrl}
    />
  )
}
