import 'server-only'
import { headers } from 'next/headers'

/** Dirección pública de la app (https://…), para enlaces absolutos como el de Google Calendar. */
export async function appOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
