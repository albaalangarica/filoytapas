import { madridNow } from './dates'
import type { Topic } from './model'

/*
 * «Añadir al calendario»: evento iCalendar (RFC 5545) para Apple/iPhone/Outlook
 * y enlace directo de Google Calendar. Cada sesión dura 2 horas por defecto.
 */

const DURATION_MS = 2 * 60 * 60 * 1000

/** Fecha y hora de Madrid → instante real (tiene en cuenta el horario de verano). */
export function madridToInstant(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  const guess = Date.UTC(y!, m! - 1, d!, h!, min!)
  const shown = madridNow(new Date(guess))
  const shownUtc = Date.UTC(
    Number(shown.slice(0, 4)),
    Number(shown.slice(5, 7)) - 1,
    Number(shown.slice(8, 10)),
    Number(shown.slice(11, 13)),
    Number(shown.slice(14, 16)),
  )
  return new Date(guess - (shownUtc - guess))
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Escapa texto según RFC 5545. */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Pliega líneas largas (máx. 75 octetos) sin partir caracteres UTF-8. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = parts.length === 0 ? 75 : 74
    if (bytes + size > limit) {
      parts.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function eventTimes(topic: Pick<Topic, 'fecha' | 'hora'>) {
  const start = madridToInstant(topic.fecha, topic.hora)
  return { start, end: new Date(start.getTime() + DURATION_MS) }
}

function eventTitle(topic: Topic): string {
  return `Filo y Tapas: ${topic.titulo}`
}

function eventDescription(topic: Topic, url: string): string {
  return [topic.cita ? `«${topic.cita}»` : '', topic.preguntas.slice(0, 3).join('\n'), url].filter(Boolean).join('\n\n')
}

export function buildIcs(topic: Topic, options: { url: string; now?: Date }): string {
  const { start, end } = eventTimes(topic)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Filo y Tapas//App//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${topic.id}@filoytapas`,
    `DTSTAMP:${utcStamp(options.now ?? new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeIcsText(eventTitle(topic))}`,
    topic.lugar ? `LOCATION:${escapeIcsText(topic.lugar)}` : null,
    `DESCRIPTION:${escapeIcsText(eventDescription(topic, options.url))}`,
    `URL:${options.url}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(eventTitle(topic))}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l): l is string => l !== null)
  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export function googleCalendarUrl(topic: Topic, url: string): string {
  const { start, end } = eventTimes(topic)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle(topic),
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: eventDescription(topic, url),
    location: topic.lugar,
    ctz: 'Europe/Madrid',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
