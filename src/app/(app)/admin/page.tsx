import type { Metadata } from 'next'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { SubmitButton } from '@/components/SubmitButton'
import { Empty, PageTitle, buttonStyles, cn } from '@/components/ui'
import { reviewRequest, setActive, setRole } from '@/lib/actions/admin'
import { requireAdmin } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { dayAndMonth } from '@/lib/domain/dates'
import type { User } from '@/lib/domain/model'
import { ResetPasswordButton } from './AdminForms'

export const metadata: Metadata = { title: 'Admin' }

const TABS = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'miembros', label: 'Miembros' },
  { id: 'temas', label: 'Temas' },
] as const

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const me = await requireAdmin()
  const { tab: tabParam } = await searchParams
  const data = await getAppData()
  const pending = data.users.filter((u) => u.estado === 'pendiente')
  const tab = TABS.find((t) => t.id === tabParam)?.id ?? (pending.length > 0 ? 'solicitudes' : 'temas')
  const members = data.users
    .filter((u) => u.estado === 'activo' || u.estado === 'baja')
    .sort((a, b) => (a.estado === b.estado ? a.nombre.localeCompare(b.nombre, 'es') : a.estado === 'activo' ? -1 : 1))

  return (
    <>
      <PageTitle eyebrow="Solo Martina y Juanma" title="Admin" />
      <Link href="/admin/temas/nuevo" className={`${buttonStyles.primary} w-full`}>
        <Icon name="plus" /> Nuevo tema
      </Link>

      <nav aria-label="Secciones de admin" className="-mx-4 mt-6 border-b border-line px-4">
        <ul className="flex gap-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`?tab=${t.id}`}
                replace
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn('inline-flex items-center gap-1.5 border-b-[3px] px-3 py-3 text-sm font-bold', tab === t.id ? 'border-mandarin' : 'border-transparent text-muted')}
              >
                {t.label}
                {t.id === 'solicitudes' && pending.length > 0 ? (
                  <span className="rounded-full bg-mandarin px-1.5 text-xs text-white">{pending.length}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-5">
        {tab === 'solicitudes' ? (
          pending.length === 0 ? (
            <Empty title="No hay solicitudes pendientes">Cuando alguien pida acceso, aparecerá aquí.</Empty>
          ) : (
            <ul className="flex flex-col gap-3">
              {pending.map((u) => (
                <li key={u.usuario} className="rounded-card border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Avatar usuario={u.usuario} nombre={u.nombre} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{u.nombre}</p>
                      <p className="text-sm text-muted">@{u.usuario}</p>
                    </div>
                  </div>
                  <form action={reviewRequest} className="mt-3 grid grid-cols-2 gap-2">
                    <input type="hidden" name="usuario" value={u.usuario} />
                    <SubmitButton name="decision" value="aprobar" pendingText="…" className="py-2.5">
                      Aprobar
                    </SubmitButton>
                    <SubmitButton name="decision" value="rechazar" pendingText="…" variant="secondary" className="py-2.5">
                      Rechazar
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === 'miembros' ? (
          <ul className="flex flex-col gap-3">
            {members.map((u) => (
              <MemberRow key={u.usuario} user={u} isMe={u.usuario === me.usuario} />
            ))}
          </ul>
        ) : null}

        {tab === 'temas' ? (
          <ul className="flex flex-col gap-2">
            {data.topics.map((t) => {
              const { day, month } = dayAndMonth(t.fecha)
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <span className="w-12 text-center font-display text-sm font-extrabold text-mandarin-700">
                    {day} {month}
                  </span>
                  <Link href={`/jueves/${encodeURIComponent(t.id)}`} className="min-w-0 flex-1 truncate font-semibold hover:text-cobalt">
                    {t.titulo}
                  </Link>
                  {!t.publicado ? <span className="rounded-full bg-cobalt-50 px-2 py-0.5 text-xs font-bold text-cobalt">Borrador</span> : null}
                  <Link href={`/admin/temas/${encodeURIComponent(t.id)}/editar`} aria-label={`Editar ${t.titulo}`} className="rounded-xl p-2 text-cobalt hover:bg-cobalt-50">
                    <Icon name="edit" />
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </>
  )
}

function MemberRow({ user, isMe }: { user: User; isMe: boolean }) {
  const active = user.estado === 'activo'
  return (
    <li className={cn('rounded-card border border-line p-4', !active && 'opacity-60')}>
      <div className="flex items-center gap-3">
        <Avatar usuario={user.usuario} nombre={user.nombre} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {user.nombre} {isMe ? <span className="text-sm font-normal text-muted">(tú)</span> : null}
          </p>
          <p className="text-sm text-muted">
            @{user.usuario} · {user.rol === 'admin' ? 'Admin' : 'Miembro'}
            {!active ? ' · De baja' : ''}
          </p>
        </div>
      </div>
      {!isMe ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-sm">
          {active ? (
            <form action={setRole}>
              <input type="hidden" name="usuario" value={user.usuario} />
              <input type="hidden" name="rol" value={user.rol === 'admin' ? 'miembro' : 'admin'} />
              <button type="submit" className="font-semibold text-cobalt">
                {user.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
              </button>
            </form>
          ) : null}
          {active ? <ResetPasswordButton usuario={user.usuario} /> : null}
          <form action={setActive}>
            <input type="hidden" name="usuario" value={user.usuario} />
            <input type="hidden" name="activo" value={active ? 'no' : 'si'} />
            <button type="submit" className={cn('font-semibold', active ? 'text-danger' : 'text-ok')}>
              {active ? 'Dar de baja' : 'Reactivar'}
            </button>
          </form>
        </div>
      ) : null}
    </li>
  )
}
