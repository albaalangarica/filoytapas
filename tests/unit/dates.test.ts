import { describe, expect, it } from 'vitest'
import { longDate, nextThursday, normalizeDate, normalizeTime, relativeLabel, todayInMadrid } from '@/lib/domain/dates'

describe('fechas', () => {
  it('acepta AAAA-MM-DD y D/M/AAAA', () => {
    expect(normalizeDate('2026-10-08')).toBe('2026-10-08')
    expect(normalizeDate('8/10/2026')).toBe('2026-10-08')
    expect(normalizeDate('31/02/2026')).toBeNull()
    expect(normalizeDate('mañana')).toBeNull()
    expect(normalizeDate('46296')).toBe('2026-10-01')
  })

  it('normaliza horas, también la fracción de día de Sheets', () => {
    expect(normalizeTime('21:00')).toBe('21:00')
    expect(normalizeTime('9:30')).toBe('09:30')
    expect(normalizeTime('21:00:00')).toBe('21:00')
    expect(normalizeTime('21h')).toBe('21:00')
    expect(normalizeTime('0,875')).toBe('21:00')
    expect(normalizeTime('0.5')).toBe('12:00')
    expect(normalizeTime('25:00')).toBeNull()
  })

  it('calcula hoy en hora de Madrid', () => {
    // 23:30 UTC del 7 de octubre ya es 8 de octubre en Madrid (UTC+2).
    expect(todayInMadrid(new Date('2026-10-07T23:30:00Z'))).toBe('2026-10-08')
  })

  it('formatea en castellano', () => {
    expect(longDate('2026-10-08')).toBe('jueves 8 de octubre')
    expect(relativeLabel('2026-10-08', '2026-10-08')).toBe('Hoy')
    expect(relativeLabel('2026-10-09', '2026-10-08')).toBe('Mañana')
    expect(relativeLabel('2026-10-15', '2026-10-12')).toBe('Este jueves')
    expect(relativeLabel('2026-10-22', '2026-10-08')).toBe('Jueves 22 oct')
  })

  it('propone el siguiente jueves', () => {
    expect(nextThursday('2026-10-08')).toBe('2026-10-08')
    expect(nextThursday('2026-10-09')).toBe('2026-10-15')
    expect(nextThursday('2026-10-05')).toBe('2026-10-08')
  })
})
