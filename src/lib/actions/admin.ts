'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { readFresh } from '@/lib/data'
import { getStore, SHEETS_CACHE_TAG } from '@/lib/store'
import { buildRow } from '@/lib/store/types'
import { hashPassword, provisionalPassword } from '@/lib/auth/password'
import { requireAdmin } from '@/lib/auth/session'
import { newTopicId } from '@/lib/domain/model'
import { amountToSheet, parseAmount } from '@/lib/domain/money'
import { firstError, topicSchema } from '@/lib/domain/validation'
import type { FormState } from './state'

/* Acciones solo para admins (Martina y Juanma). Cada acción vuelve a comprobar el rol. */

export async function saveTopic(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireAdmin()
  const parsed = topicSchema.safeParse({
    titulo: formData.get('titulo'),
    cita: formData.get('cita') ?? '',
    introduccion: formData.get('introduccion') ?? '',
    preguntas: formData.get('preguntas') ?? '',
    fecha: formData.get('fecha'),
    hora: formData.get('hora'),
    lugar: formData.get('lugar'),
    llamada: formData.get('llamada') ?? '',
    materiales_url: formData.get('materiales_url') ?? '',
    publicado: formData.get('publicado') === 'on',
  })
  if (!parsed.success) return { error: firstError(parsed.error) }
  const t = parsed.data

  const { workbook, data } = await readFresh()
  const editingId = String(formData.get('id') ?? '')
  const values = {
    fecha: t.fecha,
    hora: t.hora,
    lugar: t.lugar,
    titulo: t.titulo,
    cita: t.cita,
    introduccion: t.introduccion,
    preguntas: t.preguntas,
    llamada: t.llamada,
    materiales_url: t.materiales_url,
    publicado: t.publicado ? 'sí' : 'no',
  }

  let id = editingId
  if (editingId) {
    const topic = data.topics.find((x) => x.id === editingId)
    if (!topic) return { error: 'Este tema ya no existe.' }
    const row = workbook.TEMAS.rows.find((r) => r.rowNumber === topic.rowNumber)
    await getStore().update('TEMAS', topic.rowNumber, buildRow(workbook.TEMAS, values, row?.values))
  } else {
    id = newTopicId(t.fecha, data.topics.map((x) => x.id))
    await getStore().append('TEMAS', buildRow(workbook.TEMAS, { id, ...values, autor: me.nombre }))
  }
  // Si la sesión sale de una propuesta, la marcamos como usada.
  const fromProposal = data.proposals.find((x) => x.id === String(formData.get('propuesta') ?? ''))
  if (fromProposal) {
    const row = workbook.PROPUESTAS.rows.find((r) => r.rowNumber === fromProposal.rowNumber)
    await getStore().update('PROPUESTAS', fromProposal.rowNumber, buildRow(workbook.PROPUESTAS, { estado: 'usada' }, row?.values))
  }
  updateTag(SHEETS_CACHE_TAG)
  redirect(`/sesiones/${encodeURIComponent(id)}`)
}

async function updateUser(usuario: string, changes: Record<string, string>) {
  const { workbook, data } = await readFresh()
  const user = data.users.find((u) => u.usuario === usuario)
  if (!user) return null
  const row = workbook.USUARIOS.rows.find((r) => r.rowNumber === user.rowNumber)
  await getStore().update('USUARIOS', user.rowNumber, buildRow(workbook.USUARIOS, changes, row?.values))
  updateTag(SHEETS_CACHE_TAG)
  return user
}

export async function reviewRequest(formData: FormData): Promise<void> {
  await requireAdmin()
  const usuario = String(formData.get('usuario') ?? '')
  const decision = formData.get('decision')
  if (decision !== 'aprobar' && decision !== 'rechazar') return
  await updateUser(usuario, { estado: decision === 'aprobar' ? 'activo' : 'rechazado' })
}

export async function setRole(formData: FormData): Promise<void> {
  const me = await requireAdmin()
  const usuario = String(formData.get('usuario') ?? '')
  const rol = formData.get('rol')
  // Nadie se quita a sí mismo el rol de admin: así siempre queda al menos uno.
  if ((rol !== 'admin' && rol !== 'miembro') || usuario === me.usuario) return
  await updateUser(usuario, { rol })
}

export async function setActive(formData: FormData): Promise<void> {
  const me = await requireAdmin()
  const usuario = String(formData.get('usuario') ?? '')
  const activo = formData.get('activo') === 'si'
  if (usuario === me.usuario) return
  const { data } = await readFresh()
  const user = data.users.find((u) => u.usuario === usuario)
  if (!user) return
  // Dar de baja también cierra sus sesiones abiertas.
  await updateUser(usuario, activo ? { estado: 'activo' } : { estado: 'baja', sesion: String(user.sesion + 1) })
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const usuario = String(formData.get('usuario') ?? '')
  const { data } = await readFresh()
  const user = data.users.find((u) => u.usuario === usuario)
  if (!user) return { error: 'Ese usuario no existe.' }
  const secret = provisionalPassword()
  await updateUser(usuario, { password_hash: hashPassword(secret), sesion: String(user.sesion + 1) })
  return { ok: `Nueva contraseña para ${user.nombre}. Pásasela y que la cambie en su perfil:`, secret }
}

/**
 * Guarda lo que debe cada persona de una sesión. El formulario manda `importe:<usuario>` y,
 * si está marcado, `pagado:<usuario>`. Un importe vacío o 0 quita a esa persona de la cuenta.
 */
export async function saveBill(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const temaId = String(formData.get('temaId') ?? '')
  const { workbook, data } = await readFresh()
  if (!data.topics.some((t) => t.id === temaId)) return { error: 'Esta sesión ya no existe.' }
  const known = new Set(data.users.map((u) => u.usuario))

  const wanted = new Map<string, { importe: number; pagado: boolean }>()
  for (const [key, raw] of formData.entries()) {
    if (!key.startsWith('importe:')) continue
    const usuario = key.slice('importe:'.length)
    if (!known.has(usuario)) continue
    const importe = parseAmount(String(raw))
    if (importe !== null && Number.isNaN(importe)) {
      const nombre = data.users.find((u) => u.usuario === usuario)?.nombre ?? usuario
      return { error: `El importe de ${nombre} no es válido. Escríbelo como 12,50.` }
    }
    wanted.set(usuario, { importe: importe ?? 0, pagado: formData.get(`pagado:${usuario}`) === 'on' })
  }

  const now = new Date().toISOString()
  const existing = data.debts.filter((d) => d.temaId === temaId)
  const updates: { rowNumber: number; values: string[] }[] = []
  const clears: number[] = []
  for (const debt of existing) {
    const next = wanted.get(debt.usuario)
    if (!next) continue
    wanted.delete(debt.usuario)
    if (next.importe === 0) {
      clears.push(debt.rowNumber)
    } else if (next.importe !== debt.importe || next.pagado !== debt.pagado) {
      const row = workbook.CUENTAS.rows.find((r) => r.rowNumber === debt.rowNumber)
      updates.push({
        rowNumber: debt.rowNumber,
        values: buildRow(workbook.CUENTAS, { importe: amountToSheet(next.importe), pagado: next.pagado ? 'sí' : 'no', actualizado: now }, row?.values),
      })
    }
  }
  const appends = [...wanted.entries()]
    .filter(([, v]) => v.importe > 0)
    .map(([usuario, v]) =>
      buildRow(workbook.CUENTAS, { tema_id: temaId, usuario, importe: amountToSheet(v.importe), pagado: v.pagado ? 'sí' : 'no', actualizado: now }),
    )

  const store = getStore()
  await store.updateMany('CUENTAS', updates)
  await store.appendMany('CUENTAS', appends)
  for (const rowNumber of clears) await store.clear('CUENTAS', rowNumber)
  updateTag(SHEETS_CACHE_TAG)
  return { ok: 'Cuentas guardadas.' }
}

export async function setProposalState(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const estado = formData.get('estado')
  if (estado !== 'nueva' && estado !== 'usada' && estado !== 'archivada') return
  const { workbook, data } = await readFresh()
  const proposal = data.proposals.find((p) => p.id === id)
  if (!proposal) return
  const row = workbook.PROPUESTAS.rows.find((r) => r.rowNumber === proposal.rowNumber)
  await getStore().update('PROPUESTAS', proposal.rowNumber, buildRow(workbook.PROPUESTAS, { estado }, row?.values))
  updateTag(SHEETS_CACHE_TAG)
}
