/*
 * Contrato del Google Sheet. Cada pestaña tiene una fila de cabecera; la app localiza las columnas
 * por su nombre, así que se pueden reordenar o añadir columnas nuevas sin romper nada.
 */

export const SHEETS = {
  TEMAS: ['id', 'fecha', 'hora', 'lugar', 'titulo', 'cita', 'introduccion', 'preguntas', 'llamada', 'materiales_url', 'autor', 'publicado'],
  ASISTENCIA: ['tema_id', 'usuario', 'respuesta', 'actualizado'],
  REFLEXIONES: ['id', 'tema_id', 'usuario', 'titulo', 'url', 'creado', 'actualizado', 'texto'],
  USUARIOS: ['usuario', 'nombre', 'password_hash', 'rol', 'estado', 'creado', 'sesion'],
  CONFIG: ['clave', 'valor', 'para qué sirve'],
  CUENTAS: ['tema_id', 'usuario', 'importe', 'pagado', 'actualizado'],
  PROPUESTAS: ['id', 'usuario', 'titulo', 'descripcion', 'estado', 'creado'],
} as const

export type SheetName = keyof typeof SHEETS
export const SHEET_NAMES = Object.keys(SHEETS) as SheetName[]

export interface SheetRow {
  /** Número de fila en la hoja (1 = cabecera). */
  rowNumber: number
  values: string[]
}

export interface SheetTable {
  headers: string[]
  rows: SheetRow[]
}

export type Workbook = Record<SheetName, SheetTable>

export interface Store {
  /** `fresh` salta la caché: lo usan las escrituras para trabajar sobre el estado real. */
  read(opts?: { fresh?: boolean }): Promise<Workbook>
  append(sheet: SheetName, values: string[]): Promise<void>
  /** Varias filas en una sola llamada. */
  appendMany(sheet: SheetName, rows: string[][]): Promise<void>
  /** Varias actualizaciones en una sola llamada. */
  updateMany(sheet: SheetName, updates: { rowNumber: number; values: string[] }[]): Promise<void>
  update(sheet: SheetName, rowNumber: number, values: string[]): Promise<void>
  /** Vacía una fila. No se borran filas para que los números de fila no se desplacen. */
  clear(sheet: SheetName, rowNumber: number): Promise<void>
}

/** Convierte la respuesta cruda (filas de celdas) en tabla, saltando filas vacías. */
export function toTable(raw: string[][]): SheetTable {
  const [headerRow = [], ...rest] = raw
  const headers = headerRow.map((h) => h.trim().toLowerCase())
  const rows: SheetRow[] = []
  rest.forEach((values, index) => {
    if (values.some((cell) => cell.trim() !== '')) rows.push({ rowNumber: index + 2, values })
  })
  return { headers, rows }
}

export function cell(table: SheetTable, row: SheetRow, column: string): string {
  const index = table.headers.indexOf(column)
  return index === -1 ? '' : (row.values[index] ?? '').trim()
}

/**
 * Construye la fila a escribir respetando el orden de columnas de la hoja.
 * Parte de la fila existente para no pisar columnas que la app no conoce.
 */
export function buildRow(table: SheetTable, data: Record<string, string>, existing: string[] = []): string[] {
  const values = table.headers.map((_, i) => existing[i] ?? '')
  for (const [column, value] of Object.entries(data)) {
    const index = table.headers.indexOf(column)
    if (index !== -1) values[index] = value
  }
  return values
}
