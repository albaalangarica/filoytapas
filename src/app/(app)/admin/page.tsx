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
import { formatEuros } from '@/lib/domain/money'
import { ResetPasswordButton } from './AdminForms'

export const metadata: Metadata = { title: 'Admin' }

const TABS = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'miembros', label: 'Miembros' },
  { id: 'temas', label: 'Sesiones' },
  { id: 'cuentas', label: 'Cuentas' },
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
        <Icon name="plus" /> Nueva sesión
      </Link>

      <nav aria-label="Secciones de admin" className="-mx-4 mt-6 border-b border-line px-4">
        <ul className="flex gap-1">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`?tab=${t.id}`}
                replace
                aria-current={tab === t.id ? 'page' : undefined}
                className={cn('inline-flex items-center gap-1.5 border-b-[3px] px-3 py-3 text-sm font-bold', tab === t.id ? 'border-terra' : 'border-transparent text-muted')}
              >
                {t.label}
                {t.id === 'solicitudes' && pending.length > 0 ? (
                  <span className="rounded-full bg-terra px-1.5 text-xs text-white">{pending.length}</span>
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

        {tab === 'cuentas' ? <PendingSummary data={data} /> : null}

        {tab === 'temas' ? (
          <ul className="flex flex-col gap-2">
            {data.topics.map((t) => {
              const { day, month } = dayAndMonth(t.fecha)
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                  <span className="w-12 text-center font-display text-sm font-semibold text-terra-700">
                    {day} {month}
                  </span>
                  <Link href={`/sesiones/${encodeURIComponent(t.id)}`} className="min-w-0 flex-1 truncate font-semibold hover:text-oliva">
                    {t.titulo}
                  </Link>
                  {!t.publicado ? <span className="rounded-full bg-oliva-50 px-2 py-0.5 text-xs font-bold text-oliva">Borrador</span> : null}
                  <Link href={`/admin/temas/${encodeURIComponent(t.id)}/editar`} aria-label={`Editar ${t.titulo}`} className="rounded-xl p-2 text-oliva hover:bg-oliva-50">
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
              <button type="submit" className="font-semibold text-oliva">
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

/** Lo pendiente por persona en todas las sesiones. */
function PendingSummary({ data }: { data: Awaited<ReturnType<typeof getAppData>> }) {
  const names = new Map(data.users.map((u) => [u.usuario, u.nombre]))
  const titles = new Map(data.topics.map((t) => [t.id, t.titulo]))
  const byPerson = new Map<string, { total: number; items: { temaId: string; importe: number }[] }>()
  for (const d of data.debts) {
    if (d.pagado) continue
    const entry = byPerson.get(d.usuario) ?? { total: 0, items: [] }
    entry.total += d.importe
    entry.items.push({ temaId: d.temaId, importe: d.importe })
    byPerson.set(d.usuario, entry)
  }
  const people = [...byPerson.entries()].sort((a, b) => b[1].total - a[1].total)
  const total = people.reduce((acc, [, v]) => acc + v.total, 0)
  if (people.length === 0) {
    return <Empty title="Nadie debe nada">Las cuentas de cada sesión se meten desde su ficha, pestaña «Cuentas».</Empty>
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-terra/30 bg-terra-50 p-4">
        <p className="text-sm font-semibold text-muted">Pendiente de cobrar</p>
        <p className="font-display text-3xl font-semibold tabular-nums text-cacao">{formatEuros(total)}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {people.map(([usuario, v]) => (
          <li key={usuario} className="rounded-card border border-line bg-white p-4">
            <div className="flex items-center gap-3">
              <Avatar usuario={usuario} nombre={names.get(usuario) ?? usuario} size="sm" />
              <span className="flex-1 font-bold">{names.get(usuario) ?? usuario}</span>
              <span className="font-display text-lg font-semibold tabular-nums text-terra-700">{formatEuros(v.total)}</span>
            </div>
            <ul className="mt-2 flex flex-col gap-1 pl-10 text-sm text-muted">
              {v.items.map((i) => (
                <li key={i.temaId} className="flex justify-between gap-3">
                  <Link href={`/sesiones/${encodeURIComponent(i.temaId)}?tab=cuentas`} className="truncate hover:text-terra-700">
                    {titles.get(i.temaId) ?? i.temaId}
                  </Link>
                  <span className="tabular-nums">{formatEuros(i.importe)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
