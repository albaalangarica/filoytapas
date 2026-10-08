/* Fechas en hora de Madrid. Las fechas de los temas se guardan como AAAA-MM-DD. */

export const TIME_ZONE = 'Europe/Madrid'

/** Hoy en Madrid, como AAAA-MM-DD. */
export function todayInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Ahora en Madrid, como "AAAA-MM-DD HH:MM" (comparable como texto). */
export function madridNow(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`
}

/**
 * Acepta AAAA-MM-DD, D/M/AAAA o el número de serie de Sheets (46296 = 1/10/2026),
 * que es lo que aparece si alguien escribe la fecha a mano y Sheets la convierte.
 */
export function normalizeDate(value: string): string | null {
  const v = value.trim()
  if (/^\d{5}$/.test(v)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Number(v) * 86_400_000)
    return d.toISOString().slice(0, 10)
  }
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(v)
  if (m) return iso(Number(m[1]), Number(m[2]), Number(m[3]))
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(v)
  if (m) return iso(Number(m[3]), Number(m[2]), Number(m[1]))
  return null
}

/** Acepta 21:00, 21:00:00, 21h o la fracción de día de Sheets (0,875 = 21:00). */
export function normalizeTime(value: string): string | null {
  const v = value.trim().toLowerCase()
  let m = /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*h?$/.exec(v)
  if (m) {
    const h = Number(m[1])
    const min = Number(m[2] ?? 0)
    return h < 24 && min < 60 ? `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}` : null
  }
  m = /^0?[.,](\d+)$/.exec(v)
  if (m) {
    const total = Math.round(Number(`0.${m[1]}`) * 24 * 60)
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  }
  return null
}

function iso(y: number, mo: number, d: number): string | null {
  const date = new Date(Date.UTC(y, mo - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function asUtc(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!))
}

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function dayAndMonth(isoDate: string): { day: number; month: string } {
  const d = asUtc(isoDate)
  return { day: d.getUTCDate(), month: MONTHS_SHORT[d.getUTCMonth()]! }
}

/** "jueves 8 de octubre" */
export function longDate(isoDate: string): string {
  const d = asUtc(isoDate)
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`
}

/** "Hoy", "Mañana", "Este jueves", "Jueves 15 oct" o "Jueves pasado". */
export function relativeLabel(isoDate: string, today: string): string {
  const diff = Math.round((asUtc(isoDate).getTime() - asUtc(today).getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  const d = asUtc(isoDate)
  const weekday = WEEKDAYS[d.getUTCDay()]!
  if (diff > 1 && diff < 7) return `Este ${weekday}`
  const label = `${weekday} ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]!.toLowerCase()}`
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Siguiente jueves a partir de hoy (incluido), para proponer la fecha al crear un tema. */
export function nextThursday(today: string): string {
  const d = asUtc(today)
  const add = (4 - d.getUTCDay() + 7) % 7
  d.setUTCDate(d.getUTCDate() + add)
  return d.toISOString().slice(0, 10)
}
