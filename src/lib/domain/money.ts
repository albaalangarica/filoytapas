/* Importes en céntimos para no arrastrar errores de decimales. */

/** Acepta "12,50", "12.5", "12 €", "1.234,56". Vacío = null. Devuelve céntimos o NaN si no es válido. */
export function parseAmount(value: string): number | null {
  let v = value.replace(/€|\s/g, '')
  if (!v) return null
  // Con coma decimal, los puntos son separadores de miles.
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return Number.NaN
  return Math.round(Number(v) * 100)
}

/** 1250 → "12,50 €" */
export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

/** Para guardar en el Sheet: 1250 → "12,50" */
export function amountToSheet(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

/** Reparte un total en partes iguales; los céntimos sobrantes van a los primeros. */
export function splitEvenly(totalCents: number, people: number): number[] {
  if (people <= 0) return []
  const base = Math.floor(totalCents / people)
  const rest = totalCents - base * people
  return Array.from({ length: people }, (_, i) => base + (i < rest ? 1 : 0))
}
