import type { Metadata } from 'next'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { InstallButton } from '@/components/InstallButton'
import { SubmitButton } from '@/components/SubmitButton'
import { Empty, SectionTitle, buttonStyles } from '@/components/ui'
import { logout } from '@/lib/actions/auth'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { dayAndMonth, todayInMadrid } from '@/lib/domain/dates'
import { formatEuros } from '@/lib/domain/money'
import type { Topic } from '@/lib/domain/model'
import { MyProposals } from '@/components/MyProposals'
import { ProposeTopic } from '@/components/ProposeTopic'
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
  const myProposals = data.proposals.filter((p) => p.usuario === me.usuario)
  const myDebts = data.debts
    .filter((d) => d.usuario === me.usuario && topicsById.has(d.temaId))
    .sort((a, b) => (a.temaId < b.temaId ? 1 : -1))
  const pending = myDebts.filter((d) => !d.pagado).reduce((acc, d) => acc + d.importe, 0)

  return (
    <>
      <header className="flex items-center gap-4 pb-2 pt-6">
        <Avatar usuario={me.usuario} nombre={me.nombre} size="lg" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{me.nombre}</h1>
          <p className="text-sm text-muted">
            @{me.usuario}
            {me.rol === 'admin' ? ' · Admin' : ''}
          </p>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-card bg-cobalt-50 p-4">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-cobalt">Sesiones</dt>
          <dd className="font-display text-3xl font-extrabold tabular-nums">{attended}</dd>
        </div>
        <div className={`rounded-card p-4 ${pending > 0 ? 'bg-mandarin-50' : 'bg-ok-50'}`}>
          <dt className={`text-xs font-bold uppercase tracking-[0.12em] ${pending > 0 ? 'text-mandarin-700' : 'text-ok'}`}>
            {pending > 0 ? 'Debes' : 'Cuentas al día'}
          </dt>
          <dd className="font-display text-3xl font-extrabold tabular-nums">{formatEuros(pending)}</dd>
        </div>
      </dl>

      {me.rol !== 'admin' ? (
        <div className="mt-6 flex flex-col gap-3">
          <ProposeTopic />
          {myProposals.length > 0 ? (
            <>
              <SectionTitle>Mis propuestas</SectionTitle>
              <MyProposals proposals={myProposals} />
            </>
          ) : null}
        </div>
      ) : null}

      {myDebts.length > 0 ? (
        <>
          <SectionTitle>Mis cuentas</SectionTitle>
          <ul className="divide-y divide-line rounded-card border border-line bg-white px-4">
            {myDebts.map((d) => {
              const t = topicsById.get(d.temaId)!
              return (
                <li key={d.temaId}>
                  <Link href={`/sesiones/${encodeURIComponent(d.temaId)}`} className="flex items-center gap-3 py-3">
                    <span className="min-w-0 flex-1 truncate font-semibold">{t.titulo}</span>
                    <span className="tabular-nums">{formatEuros(d.importe)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${d.pagado ? 'bg-ok-50 text-ok' : 'bg-mandarin-50 text-mandarin-700'}`}>
                      {d.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}

      <SectionTitle>Mis sesiones</SectionTitle>
      {myThursdays.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {myThursdays.slice(0, 8).map((t) => {
            const { day, month } = dayAndMonth(t.fecha)
            return (
              <li key={t.id}>
                <Link href={`/sesiones/${encodeURIComponent(t.id)}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:border-cobalt">
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
        <Empty title="Aún no has confirmado ninguna sesión">Cuando digas «Voy 🔥», aparecerá aquí.</Empty>
      )}

      {myReflections.length > 0 ? (
        <>
          <SectionTitle>Mis aportaciones</SectionTitle>
          <ul className="flex flex-col gap-2">
            {myReflections.map((r) => (
              <li key={r.id}>
                <Link href={`/sesiones/${encodeURIComponent(r.temaId)}?tab=aportaciones`} className="block rounded-2xl border border-line p-3 hover:border-cobalt">
                  <span className="line-clamp-2 block">{r.texto}</span>
                  <span className="text-xs text-muted">{topicsById.get(r.temaId)?.titulo ?? ''}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {me.rol === 'admin' ? (
        <>
          <SectionTitle>Administración</SectionTitle>
          <Link href="/admin" className={`${buttonStyles.secondary} w-full`}>
            <Icon name="shield" /> Panel de admin
          </Link>
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
