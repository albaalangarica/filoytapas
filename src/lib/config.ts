import 'server-only'
import { z } from 'zod'

/*
 * Configuración de servidor. Los secretos solo se leen aquí y nunca llevan el prefijo NEXT_PUBLIC_.
 *
 * Modo demo: datos de ejemplo en memoria. Se activa solo con APP_MODE=demo o, fuera de producción,
 * cuando no hay Sheet configurado. En producción sin variables la app falla con un mensaje claro
 * en lugar de enseñar datos falsos.
 */

export function isDemoMode(): boolean {
  if (process.env.APP_MODE === 'demo') return true
  return !process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.NODE_ENV !== 'production'
}

const sheetsSchema = z.object({
  spreadsheetId: z.string().min(10, 'Falta GOOGLE_SHEETS_SPREADSHEET_ID'),
  clientEmail: z.email({ message: 'GOOGLE_SERVICE_ACCOUNT_EMAIL no es válido' }),
  privateKey: z.string().includes('PRIVATE KEY', { message: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no es válida' }),
  revalidateSeconds: z.coerce.number().int().min(0).max(3600).default(30),
})

export function sheetsEnv() {
  return sheetsSchema.parse({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Vercel suele guardar los saltos de línea de la clave como "\n" literales.
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    revalidateSeconds: process.env.SHEETS_REVALIDATE_SECONDS || undefined,
  })
}

const DEMO_SECRET = 'modo-demo-filo-y-tapas-no-usar-en-produccion'

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 32) return secret
  if (isDemoMode()) return DEMO_SECRET
  throw new Error('Falta SESSION_SECRET (mínimo 32 caracteres)')
}
