import { ConfigError } from '@/lib/config'

/** Traduce un fallo de conexión con Google a algo que se pueda arreglar (sin revelar secretos). */
export function explainStoreError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (error instanceof ConfigError) return `La app no está bien configurada en Vercel: ${message}`
  if (/Google OAuth respondió (400|401)/.test(message) || /DECODER|PEM|asn1|key/i.test(message)) {
    return 'Google rechaza la clave: revisa GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (copiada entera del JSON) y GOOGLE_SERVICE_ACCOUNT_EMAIL.'
  }
  if (/Google Sheets respondió 403/.test(message)) {
    return 'La cuenta de servicio no tiene acceso al Sheet: compártelo con su email como Editor.'
  }
  if (/Google Sheets respondió 404/.test(message)) return 'No se encuentra el Sheet: revisa GOOGLE_SHEETS_SPREADSHEET_ID.'
  if (/Google Sheets respondió 400/.test(message)) return 'El Sheet no tiene las pestañas esperadas (TEMAS, ASISTENCIA, REFLEXIONES, USUARIOS, CONFIG).'
  return 'No hemos podido conectar con el Google Sheet. Inténtalo de nuevo en un momento.'
}
