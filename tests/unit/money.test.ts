import { describe, expect, it } from 'vitest'
import { amountToSheet, formatEuros, parseAmount, splitEvenly } from '@/lib/domain/money'

describe('dinero', () => {
  it('entiende importes como los escribe la gente', () => {
    expect(parseAmount('12,50')).toBe(1250)
    expect(parseAmount('12.5')).toBe(1250)
    expect(parseAmount('12 €')).toBe(1200)
    expect(parseAmount('1.234,56')).toBe(123456)
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('doce')).toBeNaN()
    expect(parseAmount('-3')).toBeNaN()
  })

  it('formatea y guarda en euros', () => {
    expect(formatEuros(1250).replace(/\s/g, ' ')).toBe('12,50 €')
    expect(amountToSheet(850)).toBe('8,50')
  })

  it('reparte sin perder céntimos', () => {
    const parts = splitEvenly(10000, 3)
    expect(parts).toEqual([3334, 3333, 3333])
    expect(parts.reduce((a, b) => a + b, 0)).toBe(10000)
  })
})
