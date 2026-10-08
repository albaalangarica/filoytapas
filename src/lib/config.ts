import 'server-only'
import { z } from 'zod'

/*
 * Configuración de servidor. Los secretos solo se leen aquí y nunca llevan el prefijo NEXT_PUBLIC_.
 *
 * Modo demo: datos de ejemplo en memoria. Se activa solo con APP_MODE=demo o, fuera de producción,
 * cuando no hay Sheet configurado. En producción sin variables la app enseña qué falta
 * en lugar de enseñar datos falsos.
 */

export function isDemoMode(): boolean {
  if (process.env.APP_MODE === 'demo') return true
  return !env('GOOGLE_SHEETS_SPREADSHEET_ID') && process.env.NODE_ENV !== 'production'
}

/** Lee una variable quitando espacios y comillas que se cuelan al copiar y pegar. */
function env(name: string): string {
  return (process.env[name] ?? '').trim().replace(/^["']+|["']+$/g, '').trim()
}

/**
 * Si en GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY se pega el archivo JSON entero de la cuenta de servicio
 * (lo más fácil: abrirlo, seleccionar todo y copiar), se leen de él la clave y el email.
 */
function serviceAccountJson(): { private_key?: string; client_email?: string } | null {
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').trim()
  if (!raw.startsWith('{')) return null
  try {
    return JSON.parse(raw) as { private_key?: string; client_email?: string }
  } catch {
    return null
  }
}

/** La clave privada tal como la espera Node, aunque se haya pegado con "\n" literales, comillas o dentro del JSON. */
function privateKey(): string {
  const fromJson = serviceAccountJson()?.private_key
  return (fromJson ?? env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')).replace(/\\n/g, '\n').replace(/\r/g, '')
}

function clientEmail(): string {
  return serviceAccountJson()?.client_email?.trim() || env('GOOGLE_SERVICE_ACCOUNT_EMAIL')
}

/**
 * Problemas de configuración, nombrando la variable pero nunca su valor.
 * Se enseñan en la pantalla de entrada para poder arreglarlos sin mirar los registros.
 */
export function configProblems(): string[] {
  if (isDemoMode()) return []
  const problems: string[] = []
  const id = env('GOOGLE_SHEETS_SPREADSHEET_ID')
  if (!id) problems.push('Falta GOOGLE_SHEETS_SPREADSHEET_ID.')
  else if (id.includes('/')) problems.push('GOOGLE_SHEETS_SPREADSHEET_ID debe ser solo el ID, no la URL entera.')
  const email = clientEmail()
  if (!email) problems.push('Falta GOOGLE_SERVICE_ACCOUNT_EMAIL.')
  else if (!email.endsWith('.iam.gserviceaccount.com')) problems.push('GOOGLE_SERVICE_ACCOUNT_EMAIL no parece el email de una cuenta de servicio.')
  const key = privateKey()
  if (!key) problems.push('Falta GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.')
  else if ((process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').trim().startsWith('{') && !serviceAccountJson()) {
    problems.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY parece el archivo JSON, pero está incompleto: ábrelo, selecciona todo (Ctrl+A) y pégalo entero.')
  } else if (!key.includes('-----BEGIN PRIVATE KEY-----') || !key.includes('-----END PRIVATE KEY-----')) {
    problems.push('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY está incompleta. Lo más fácil: abre el archivo JSON de la clave, selecciona todo (Ctrl+A), cópialo y pégalo entero como valor.')
  }
  const secret = env('SESSION_SECRET')
  if (!secret) problems.push('Falta SESSION_SECRET.')
  else if (secret.length < 32) problems.push('SESSION_SECRET es demasiado corto (mínimo 32 caracteres).')
  return problems
}

export class ConfigError extends Error {}

const sheetsSchema = z.object({
  spreadsheetId: z.string().min(10),
  clientEmail: z.email(),
  privateKey: z.string().includes('PRIVATE KEY'),
  revalidateSeconds: z.coerce.number().int().min(0).max(3600).default(30),
})

export function sheetsEnv() {
  const problems = configProblems()
  if (problems.length > 0) throw new ConfigError(problems.join(' '))
  return sheetsSchema.parse({
    spreadsheetId: env('GOOGLE_SHEETS_SPREADSHEET_ID'),
    clientEmail: clientEmail(),
    privateKey: privateKey(),
    revalidateSeconds: process.env.SHEETS_REVALIDATE_SECONDS || undefined,
  })
}

const DEMO_SECRET = 'modo-demo-filo-y-tapas-no-usar-en-produccion'

export function sessionSecret(): string {
  const secret = env('SESSION_SECRET')
  if (secret.length >= 32) return secret
  if (isDemoMode()) return DEMO_SECRET
  throw new ConfigError('Falta SESSION_SECRET (mínimo 32 caracteres).')
}
