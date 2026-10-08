'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { readFresh } from '@/lib/data'
import { getStore, SHEETS_CACHE_TAG } from '@/lib/store'
import { buildRow } from '@/lib/store/types'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { endSession, requireUser, startSession } from '@/lib/auth/session'
import { normalizeUsername } from '@/lib/domain/model'
import { firstError, passwordSchema, registerSchema } from '@/lib/domain/validation'
import { explainStoreError } from '@/lib/store/errors'
import type { FormState } from './state'

/*
 * Límite simple de intentos por usuario (en memoria de cada instancia): frena a quien prueba
 * contraseñas a lo loco sin bloquear a nadie mucho rato.
 */
const attempts = new Map<string, { count: number; until: number }>()
const MAX_ATTEMPTS = 5
const LOCK_MS = 5 * 60_000

function isLocked(usuario: string): boolean {
  const entry = attempts.get(usuario)
  return Boolean(entry && entry.count >= MAX_ATTEMPTS && entry.until > Date.now())
}

function registerFailure(usuario: string) {
  const entry = attempts.get(usuario)
  const count = entry && entry.until > Date.now() ? entry.count + 1 : 1
  attempts.set(usuario, { count, until: Date.now() + LOCK_MS })
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : ''
  return next.startsWith('/') && !next.startsWith('//') ? next : '/'
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const usuario = normalizeUsername(String(formData.get('usuario') ?? ''))
  const password = String(formData.get('password') ?? '')
  if (!usuario || !password) return { error: 'Escribe tu usuario y tu contraseña.' }
  if (isLocked(usuario)) return { error: 'Demasiados intentos. Espera unos minutos y vuelve a probar.' }

  let data
  try {
    ;({ data } = await readFresh())
  } catch (error) {
    console.error('login: no se pudo leer el Sheet', error)
    return { error: explainStoreError(error) }
  }
  const user = data.users.find((u) => u.usuario === usuario)
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    registerFailure(usuario)
    return { error: 'Usuario o contraseña incorrectos.' }
  }
  attempts.delete(usuario)
  if (user.estado === 'pendiente') return { error: 'Tu solicitud está pendiente. Martina o Juanma te darán acceso pronto.' }
  if (user.estado !== 'activo') return { error: 'Esta cuenta no tiene acceso. Habla con Martina o Juanma.' }

  await startSession(user)
  redirect(safeNext(formData.get('next')))
}

export async function requestAccess(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    nombre: formData.get('nombre'),
    usuario: formData.get('usuario'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: firstError(parsed.error) }
  if (parsed.data.password !== formData.get('password2')) return { error: 'Las dos contraseñas no coinciden.' }

  try {
    const { workbook, data } = await readFresh()
    if (data.users.some((u) => u.usuario === parsed.data.usuario)) {
      return { error: 'Ese nombre de usuario ya existe. Prueba con otro.' }
    }
    await getStore().append(
      'USUARIOS',
      buildRow(workbook.USUARIOS, {
        usuario: parsed.data.usuario,
        nombre: parsed.data.nombre,
        password_hash: hashPassword(parsed.data.password),
        rol: 'miembro',
        estado: 'pendiente',
        creado: new Date().toISOString(),
        sesion: '1',
      }),
    )
  } catch (error) {
    console.error('solicitar acceso: no se pudo escribir en el Sheet', error)
    return { error: explainStoreError(error) }
  }
  updateTag(SHEETS_CACHE_TAG)
  return { ok: '¡Solicitud enviada! Cuando Martina o Juanma la aprueben, podrás entrar con tu usuario y contraseña.' }
}

export async function logout() {
  await endSession()
  redirect('/entrar')
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser()
  const current = String(formData.get('actual') ?? '')
  const parsed = passwordSchema.safeParse(formData.get('nueva'))
  if (!parsed.success) return { error: firstError(parsed.error) }
  if (parsed.data !== formData.get('nueva2')) return { error: 'Las dos contraseñas nuevas no coinciden.' }

  const { workbook, data } = await readFresh()
  const user = data.users.find((u) => u.usuario === me.usuario)
  if (!user || !verifyPassword(current, user.passwordHash)) return { error: 'La contraseña actual no es correcta.' }

  const row = workbook.USUARIOS.rows.find((r) => r.rowNumber === user.rowNumber)
  const sesion = user.sesion + 1
  await getStore().update(
    'USUARIOS',
    user.rowNumber,
    buildRow(workbook.USUARIOS, { password_hash: hashPassword(parsed.data), sesion: String(sesion) }, row?.values),
  )
  updateTag(SHEETS_CACHE_TAG)
  // Este móvil sigue dentro; los demás tendrán que volver a entrar.
  await startSession({ usuario: user.usuario, sesion })
  return { ok: 'Contraseña cambiada.' }
}
