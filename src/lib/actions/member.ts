'use server'

import { randomUUID } from 'node:crypto'
import { updateTag } from 'next/cache'
import { readFresh } from '@/lib/data'
import { getStore, SHEETS_CACHE_TAG } from '@/lib/store'
import { buildRow } from '@/lib/store/types'
import { requireUser } from '@/lib/auth/session'
import { todayInMadrid } from '@/lib/domain/dates'
import { isOpenForContributions, isOpenForRsvp } from '@/lib/domain/model'
import { firstError, reflectionSchema } from '@/lib/domain/validation'
import type { FormState } from './state'

/* Acciones de cualquier miembro: confirmar asistencia y gestionar sus aportaciones. */

export async function setAttendance(formData: FormData): Promise<void> {
  const me = await requireUser()
  const temaId = String(formData.get('temaId') ?? '')
  const respuesta = formData.get('respuesta')
  if (respuesta !== 'voy' && respuesta !== 'no') return

  const { workbook, data } = await readFresh()
  const topic = data.topics.find((t) => t.id === temaId)
  if (!topic || !isOpenForRsvp(topic, todayInMadrid())) return

  const existing = data.attendance.find((a) => a.temaId === temaId && a.usuario === me.usuario)
  const values = { tema_id: temaId, usuario: me.usuario, respuesta, actualizado: new Date().toISOString() }
  if (existing) {
    if (existing.respuesta === respuesta) return
    const row = workbook.ASISTENCIA.rows.find((r) => r.rowNumber === existing.rowNumber)
    await getStore().update('ASISTENCIA', existing.rowNumber, buildRow(workbook.ASISTENCIA, values, row?.values))
  } else {
    await getStore().append('ASISTENCIA', buildRow(workbook.ASISTENCIA, values))
  }
  updateTag(SHEETS_CACHE_TAG)
}

export async function addReflection(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser()
  const temaId = String(formData.get('temaId') ?? '')
  const parsed = reflectionSchema.safeParse({ texto: formData.get('texto'), url: formData.get('url') ?? '' })
  if (!parsed.success) return { error: firstError(parsed.error) }

  const { workbook, data } = await readFresh()
  const topic = data.topics.find((t) => t.id === temaId)
  if (!topic || !topic.publicado) return { error: 'Esta sesión ya no existe.' }
  if (!isOpenForContributions(topic)) return { error: 'Las aportaciones se abren cuando empieza la sesión.' }

  await getStore().append(
    'REFLEXIONES',
    buildRow(workbook.REFLEXIONES, {
      id: randomUUID().slice(0, 8),
      tema_id: temaId,
      usuario: me.usuario,
      texto: parsed.data.texto,
      url: parsed.data.url,
      creado: new Date().toISOString(),
    }),
  )
  updateTag(SHEETS_CACHE_TAG)
  return { ok: '¡Aportación publicada!' }
}

export async function editReflection(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser()
  const id = String(formData.get('id') ?? '')
  const parsed = reflectionSchema.safeParse({ texto: formData.get('texto'), url: formData.get('url') ?? '' })
  if (!parsed.success) return { error: firstError(parsed.error) }

  const { workbook, data } = await readFresh()
  const reflection = data.reflections.find((r) => r.id === id)
  if (!reflection) return { error: 'Esta aportación ya no existe.' }
  if (reflection.usuario !== me.usuario) return { error: 'Solo puedes editar tus aportaciones.' }

  const row = workbook.REFLEXIONES.rows.find((r) => r.rowNumber === reflection.rowNumber)
  await getStore().update(
    'REFLEXIONES',
    reflection.rowNumber,
    buildRow(workbook.REFLEXIONES, { texto: parsed.data.texto, url: parsed.data.url, actualizado: new Date().toISOString() }, row?.values),
  )
  updateTag(SHEETS_CACHE_TAG)
  return { ok: 'Guardado.' }
}

export async function deleteReflection(formData: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(formData.get('id') ?? '')
  const { data } = await readFresh()
  const reflection = data.reflections.find((r) => r.id === id)
  if (!reflection) return
  // Cada uno borra las suyas; los admins pueden borrar cualquiera.
  if (reflection.usuario !== me.usuario && me.rol !== 'admin') return
  await getStore().clear('REFLEXIONES', reflection.rowNumber)
  updateTag(SHEETS_CACHE_TAG)
}
