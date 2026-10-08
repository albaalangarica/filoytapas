'use client'

import { useActionState, useState } from 'react'
import { saveBill } from '@/lib/actions/admin'
import { initialFormState } from '@/lib/actions/state'
import { amountToSheet, formatEuros, parseAmount, splitEvenly } from '@/lib/domain/money'
import { Avatar } from './Avatar'
import { SubmitButton } from './SubmitButton'
import { Notice, buttonStyles, inputStyles } from './ui'

export interface BillPerson {
  usuario: string
  nombre: string
  went: boolean
  importe: number | null
  pagado: boolean
}

/** Cuentas de una sesión (solo admins): cuánto debe cada uno, con reparto a partes iguales. */
export function BillForm({ temaId, people }: { temaId: string; people: BillPerson[] }) {
  const [state, action] = useActionState(saveBill, initialFormState)
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(people.map((p) => [p.usuario, p.importe ? amountToSheet(p.importe) : ''])),
  )
  const [total, setTotal] = useState('')
  const goers = people.filter((p) => p.went)
  const main = people.filter((p) => p.went || p.importe)
  const others = people.filter((p) => !p.went && !p.importe)

  const sum = Object.values(amounts).reduce((acc, v) => {
    const c = parseAmount(v)
    return acc + (c && !Number.isNaN(c) ? c : 0)
  }, 0)

  function split() {
    const cents = parseAmount(total)
    if (!cents || Number.isNaN(cents) || goers.length === 0) return
    const parts = splitEvenly(cents, goers.length)
    setAmounts((prev) => ({ ...prev, ...Object.fromEntries(goers.map((p, i) => [p.usuario, amountToSheet(parts[i]!)])) }))
  }

  const row = (p: BillPerson) => (
    <li key={p.usuario} className="flex items-center gap-3 py-2.5">
      <Avatar usuario={p.usuario} nombre={p.nombre} size="sm" />
      <span className="min-w-0 flex-1 truncate font-semibold">{p.nombre}</span>
      <div className="relative w-28">
        <input
          aria-label={`Importe de ${p.nombre}`}
          name={`importe:${p.usuario}`}
          inputMode="decimal"
          value={amounts[p.usuario] ?? ''}
          onChange={(e) => setAmounts((prev) => ({ ...prev, [p.usuario]: e.target.value }))}
          placeholder="0,00"
          className={`${inputStyles} py-2 pr-7 text-right tabular-nums`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">€</span>
      </div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <input type="checkbox" name={`pagado:${p.usuario}`} defaultChecked={p.pagado} className="size-5 accent-oliva" />
        Pagado
      </label>
    </li>
  )

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="temaId" value={temaId} />

      <div className="rounded-card bg-mist p-4">
        <p className="mb-2 text-sm font-bold">Repartir a partes iguales</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              aria-label="Total de la cuenta"
              inputMode="decimal"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="Total, p. ej. 86,40"
              className={`${inputStyles} pr-7`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">€</span>
          </div>
          <button type="button" onClick={split} disabled={goers.length === 0} className={buttonStyles.secondary}>
            Repartir
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Entre los {goers.length} que dijeron «Voy». Después puedes ajustar cada importe a mano.
        </p>
      </div>

      {main.length > 0 ? <ul className="divide-y divide-line rounded-card border border-line bg-white px-4">{main.map(row)}</ul> : null}

      {others.length > 0 ? (
        <details className="rounded-card border border-line bg-white px-4 py-3">
          <summary className="cursor-pointer text-sm font-bold text-terra-700">Añadir a alguien más ({others.length})</summary>
          <ul className="mt-2 divide-y divide-line">{others.map(row)}</ul>
        </details>
      ) : null}

      <p className="text-right text-sm text-muted">
        Suma: <b className="tabular-nums text-ink">{formatEuros(sum)}</b>
      </p>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
      <SubmitButton pendingText="Guardando…">Guardar cuentas</SubmitButton>
      <p className="text-xs text-muted">Cada persona solo ve lo suyo. Deja un importe vacío para quitar a alguien de la cuenta.</p>
    </form>
  )
}
