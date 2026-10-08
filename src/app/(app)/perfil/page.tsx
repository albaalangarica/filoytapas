import type { Metadata } from 'next'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { InstallButton } from '@/components/InstallButton'
import { SubmitButton } from '@/components/SubmitButton'
import { Empty, SectionTitle } from '@/components/ui'
import { logout } from '@/lib/actions/auth'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { dayAndMonth, todayInMadrid } from '@/lib/domain/dates'
import type { Topic } from '@/lib/domain/model'
import { ChangePasswordForm } from './ProfileForms'

export const metadata: Metadata = { title: 'Perfil' }

export default async function ProfilePage() {
  const me = await requireUser()
  const data = await getAppData()
  const today = todayInMadrid()
  const topicsById = new Map(data.topics.map((t) => [t.id, t]))
  const myThursdays = data.attendance
    .filter((a) => a.usuario === me.usuario && a.respuesta === 'voy')
    .map((a) => topicsById.get(a.temaId))
    .filter((t): t is Topic => t !== undefined && t.publicado)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  const attended = myThursdays.filter((t) => t.fecha < today).length
  const myReflections = data.reflections.filter((r) => r.usuario === me.usuario)

  return (
    <>
      <header className="flex items-center gap-4 pb-2 pt-6">
        <Avatar usuario={me.usuario} nombre={me.nombre} size="lg" />
        <div>
          <h1 className="text-2xl font-extrabold">{me.nombre}</h1>
          <p className="text-sm text-muted">
            @{me.usuario}
            {me.rol === 'admin' ? ' · Admin' : ''}
          </p>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-mandarin-50 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-mandarin-700">Jueves en la mesa</dt>
          <dd className="font-display text-3xl font-extrabold tabular-nums">{attended}</dd>
        </div>
        <div className="rounded-card bg-cobalt-50 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-cobalt">Reflexiones</dt>
          <dd className="font-display text-3xl font-extrabold tabular-nums">{myReflections.length}</dd>
        </div>
      </dl>

      <SectionTitle>Mis jueves</SectionTitle>
      {myThursdays.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {myThursdays.slice(0, 8).map((t) => {
            const { day, month } = dayAndMonth(t.fecha)
            return (
              <li key={t.id}>
                <Link href={`/jueves/${encodeURIComponent(t.id)}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:border-cobalt">
                  <span className="w-12 text-center font-display text-sm font-extrabold text-mandarin-700">
                    {day} {month}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{t.titulo}</span>
                  {t.fecha >= today ? <span className="rounded-full bg-mandarin-50 px-2 py-0.5 text-xs font-bold text-mandarin-700">Voy 🔥</span> : null}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Empty title="Aún no has confirmado ningún jueves">Cuando digas «Voy 🔥», aparecerá aquí.</Empty>
      )}

      {myReflections.length > 0 ? (
        <>
          <SectionTitle>Mis reflexiones</SectionTitle>
          <ul className="flex flex-col gap-2">
            {myReflections.map((r) => (
              <li key={r.id}>
                <Link href={`/jueves/${encodeURIComponent(r.temaId)}?tab=reflexiones`} className="block rounded-2xl border border-line p-3 hover:border-cobalt">
                  <span className="block font-semibold">{r.titulo}</span>
                  <span className="text-xs text-muted">{topicsById.get(r.temaId)?.titulo ?? ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <SectionTitle>Instalar la app</SectionTitle>
      <InstallButton />

      <SectionTitle>Cambiar contraseña</SectionTitle>
      <ChangePasswordForm />

      <form action={logout} className="mt-10">
        <SubmitButton variant="bare" pendingText="Saliendo…" className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold text-danger hover:bg-danger-50">
          <Icon name="logout" /> Cerrar sesión
        </SubmitButton>
      </form>
    </>
  )
}
