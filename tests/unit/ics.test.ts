import { describe, expect, it } from 'vitest'
import { buildIcs, escapeIcsText, foldIcsLine, googleCalendarUrl, madridToInstant } from '@/lib/domain/ics'
import type { Topic } from '@/lib/domain/model'

const topic: Topic = {
  id: '2026-10-08',
  fecha: '2026-10-08',
  hora: '21:00',
  lugar: 'Bar Trinidad',
  titulo: 'PODER: ¿QUIÉN MANDA REALMENTE?',
  cita: 'Vivimos en democracia.',
  introduccion: '',
  preguntas: ['¿Democracia o tecnocracia?'],
  llamada: '',
  materialesUrl: '',
  autor: 'Juanma',
  publicado: true,
  rowNumber: 3,
}

describe('calendario', () => {
  it('convierte la hora de Madrid a UTC con horario de verano e invierno', () => {
    expect(madridToInstant('2026-10-08', '21:00').toISOString()).toBe('2026-10-08T19:00:00.000Z')
    expect(madridToInstant('2026-12-10', '21:00').toISOString()).toBe('2026-12-10T20:00:00.000Z')
  })

  it('genera un .ics válido de 2 horas', () => {
    const ics = buildIcs(topic, { url: 'https://x.vercel.app/sesiones/2026-10-08', now: new Date('2026-10-01T00:00:00Z') })
    expect(ics).toContain('DTSTART:20261008T190000Z')
    expect(ics).toContain('DTEND:20261008T210000Z')
    expect(ics).toContain('LOCATION:Bar Trinidad')
    expect(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true)
  })

  it('escapa y pliega texto', () => {
    expect(escapeIcsText('a;b,c\nd')).toBe('a\;b\\,c\\nd')
    expect(foldIcsLine('x'.repeat(100)).split('\r\n ')).toHaveLength(2)
  })

  it('enlaza a Google Calendar con fechas y lugar', () => {
    const url = new URL(googleCalendarUrl(topic, 'https://x.vercel.app/sesiones/2026-10-08'))
    expect(url.searchParams.get('dates')).toBe('20261008T190000Z/20261008T210000Z')
    expect(url.searchParams.get('location')).toBe('Bar Trinidad')
    expect(url.searchParams.get('text')).toBe('Filo y Tapas: PODER: ¿QUIÉN MANDA REALMENTE?')
  })
})
