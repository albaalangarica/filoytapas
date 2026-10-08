import 'server-only'
import { createSign } from 'node:crypto'
import { sheetsEnv } from '@/lib/config'
import { SHEET_NAMES, toTable, type SheetName, type Store, type Workbook } from './types'

/*
 * Cliente mínimo de la API de Google Sheets con cuenta de servicio.
 * fetch + firma JWT de Node, sin la dependencia "googleapis".
 */

export const SHEETS_CACHE_TAG = 'sheets'
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://sheets.googleapis.com/v4/spreadsheets'

let cachedToken: { value: string; expiresAt: number } | null = null

export function buildServiceAccountJwt(clientEmail: string, privateKey: string, nowSeconds: number): string {
  const b64 = (input: string) => Buffer.from(input).toString('base64url')
  const header = b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64(JSON.stringify({ iss: clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + 3600 }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  return `${header}.${claims}.${signer.sign(privateKey).toString('base64url')}`
}

async function accessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value
  const env = sheetsEnv()
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildServiceAccountJwt(env.clientEmail, env.privateKey, now),
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Google OAuth respondió ${res.status}`)
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) throw new Error('Google OAuth no devolvió access_token')
  cachedToken = { value: json.access_token, expiresAt: now + (json.expires_in ?? 3600) }
  return json.access_token
}

function sheetUrl(path: string, params?: Record<string, string>): string {
  const query = params ? `?${new URLSearchParams(params)}` : ''
  return `${API}/${encodeURIComponent(sheetsEnv().spreadsheetId)}${path}${query}`
}

async function call(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json', ...init.headers },
  })
  if (!res.ok) throw new Error(`Google Sheets respondió ${res.status}`)
  return res
}

function columnLetter(count: number): string {
  let n = Math.max(count, 1)
  let letters = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

export const googleStore: Store = {
  async read({ fresh = false } = {}): Promise<Workbook> {
    const env = sheetsEnv()
    const params = new URLSearchParams({ valueRenderOption: 'FORMATTED_VALUE', majorDimension: 'ROWS' })
    for (const name of SHEET_NAMES) params.append('ranges', `${name}!A1:Z5000`)
    const res = await call(`${API}/${encodeURIComponent(env.spreadsheetId)}/values:batchGet?${params}`, {
      method: 'GET',
      ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: env.revalidateSeconds, tags: [SHEETS_CACHE_TAG] } }),
    })
    const json = (await res.json()) as { valueRanges?: { values?: unknown[][] }[] }
    const workbook = {} as Workbook
    SHEET_NAMES.forEach((name, index) => {
      const values = json.valueRanges?.[index]?.values ?? []
      workbook[name] = toTable(values.map((row) => row.map((c) => (c == null ? '' : String(c)))))
    })
    return workbook
  },

  async append(sheet: SheetName, values: string[]) {
    // RAW: lo que escribe la gente se guarda tal cual (un texto que empieza por "=" no se convierte en fórmula).
    await call(sheetUrl(`/values/${encodeURIComponent(`${sheet}!A1`)}:append`, { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' }), {
      method: 'POST',
      body: JSON.stringify({ values: [values] }),
      cache: 'no-store',
    })
  },

  async update(sheet: SheetName, rowNumber: number, values: string[]) {
    const range = `${sheet}!A${rowNumber}:${columnLetter(values.length)}${rowNumber}`
    await call(sheetUrl(`/values/${encodeURIComponent(range)}`, { valueInputOption: 'RAW' }), {
      method: 'PUT',
      body: JSON.stringify({ values: [values] }),
      cache: 'no-store',
    })
  },

  async clear(sheet: SheetName, rowNumber: number) {
    const range = `${sheet}!A${rowNumber}:Z${rowNumber}`
    await call(sheetUrl(`/values/${encodeURIComponent(range)}:clear`), { method: 'POST', body: '{}', cache: 'no-store' })
  },
}
