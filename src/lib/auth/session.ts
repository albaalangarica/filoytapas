import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionSecret } from '@/lib/config'
import { getAppData } from '@/lib/data'
import type { User } from '@/lib/domain/model'
import { createToken, readToken, SESSION_COOKIE, SESSION_DAYS } from './token'

/** Usuario de la petición actual, o null si no hay sesión válida o la cuenta ya no está activa. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = readToken((await cookies()).get(SESSION_COOKIE)?.value, sessionSecret())
  if (!payload) return null
  const { users } = await getAppData()
  const user = users.find((u) => u.usuario === payload.u)
  if (!user || user.estado !== 'activo' || user.sesion !== payload.v) return null
  return user
})

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect('/entrar')
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser()
  if (user.rol !== 'admin') redirect('/')
  return user
}

export async function startSession(user: Pick<User, 'usuario' | 'sesion'>) {
  ;(await cookies()).set(SESSION_COOKIE, createToken(user.usuario, user.sesion, sessionSecret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  })
}

export async function endSession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}
