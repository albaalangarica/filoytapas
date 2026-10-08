import { createHmac, timingSafeEqual } from 'node:crypto'

/*
 * Token de sesión firmado (HMAC-SHA256): usuario, versión de sesión y caducidad.
 * La versión ("sesion" en USUARIOS) sube al resetear o cambiar la contraseña, lo que cierra
 * las sesiones abiertas en otros móviles.
 */

export const SESSION_COOKIE = 'fyt_sesion'
export const SESSION_DAYS = 30

export interface SessionPayload {
  u: string
  v: number
  e: number
}

function sign(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function createToken(usuario: string, version: number, secret: string, now = Date.now()): string {
  const payload: SessionPayload = { u: usuario, v: version, e: now + SESSION_DAYS * 86_400_000 }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function readToken(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token) return null
  const [data, signature] = token.split('.')
  if (!data || !signature) return null
  const expected = Buffer.from(sign(data, secret))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (typeof payload.u !== 'string' || typeof payload.v !== 'number' || typeof payload.e !== 'number') return null
    if (payload.e < now) return null
    return payload
  } catch {
    return null
  }
}
