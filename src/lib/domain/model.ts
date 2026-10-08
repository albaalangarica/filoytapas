import { cell, type SheetRow, type SheetTable, type Workbook } from '@/lib/store/types'
import { normalizeDate } from './dates'

/* Tipos de dominio y lectura de las pestañas del Sheet. Funciones puras: fáciles de testear. */

export type Role = 'miembro' | 'admin'
export type UserStatus = 'pendiente' | 'activo' | 'rechazado' | 'baja'
export type Answer = 'voy' | 'no'

export interface Topic {
  id: string
  fecha: string
  hora: string
  lugar: string
  titulo: string
  cita: string
  introduccion: string
  preguntas: string[]
  llamada: string
  materialesUrl: string
  autor: string
  publicado: boolean
  rowNumber: number
}

export interface User {
  usuario: string
  nombre: string
  passwordHash: string
  rol: Role
  estado: UserStatus
  creado: string
  sesion: number
  rowNumber: number
}

export interface Attendance {
  temaId: string
  usuario: string
  respuesta: Answer
  actualizado: string
  rowNumber: number
}

export interface Reflection {
  id: string
  temaId: string
  usuario: string
  titulo: string
  url: string
  creado: string
  rowNumber: number
}

export interface AppConfig {
  driveUrl: string
  lugarDefecto: string
  horaDefecto: string
  mapsUrl: string
  ciudad: string
}

const YES = new Set(['sí', 'si', 'true', 'verdadero', '1', 'x', 'yes'])

function rows<T>(table: SheetTable, map: (get: (column: string) => string, row: SheetRow) => T | null): T[] {
  const out: T[] = []
  for (const row of table.rows) {
    const item = map((column) => cell(table, row, column), row)
    if (item) out.push(item)
  }
  return out
}

export function safeUrl(value: string): string {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : ''
  } catch {
    return ''
  }
}

export function parseTopics(table: SheetTable): Topic[] {
  return rows(table, (get, row) => {
    const fecha = normalizeDate(get('fecha'))
    const id = get('id') || fecha
    if (!id || !fecha || !get('titulo')) return null
    return {
      id,
      fecha,
      hora: get('hora') || '21:00',
      lugar: get('lugar'),
      titulo: get('titulo'),
      cita: get('cita').replace(/^["“«]+|["”»]+$/g, ''),
      introduccion: get('introduccion'),
      preguntas: get('preguntas')
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean),
      llamada: get('llamada'),
      materialesUrl: safeUrl(get('materiales_url')),
      autor: get('autor'),
      publicado: YES.has(get('publicado').toLowerCase()),
      rowNumber: row.rowNumber,
    }
  }).sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
}

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase()
}

export function parseUsers(table: SheetTable): User[] {
  return rows(table, (get, row) => {
    const usuario = normalizeUsername(get('usuario'))
    if (!usuario) return null
    const rol = get('rol').toLowerCase() === 'admin' ? 'admin' : 'miembro'
    const estadoRaw = get('estado').toLowerCase()
    const estado: UserStatus = (['pendiente', 'activo', 'rechazado', 'baja'] as const).find((s) => s === estadoRaw) ?? 'pendiente'
    return {
      usuario,
      nombre: get('nombre') || usuario,
      passwordHash: get('password_hash'),
      rol,
      estado,
      creado: get('creado'),
      sesion: Number.parseInt(get('sesion'), 10) || 1,
      rowNumber: row.rowNumber,
    }
  })
}

export function parseAttendance(table: SheetTable): Attendance[] {
  return rows(table, (get, row) => {
    const respuesta = get('respuesta').toLowerCase()
    if (respuesta !== 'voy' && respuesta !== 'no') return null
    const temaId = get('tema_id')
    const usuario = normalizeUsername(get('usuario'))
    if (!temaId || !usuario) return null
    return { temaId, usuario, respuesta, actualizado: get('actualizado'), rowNumber: row.rowNumber }
  })
}

export function parseReflections(table: SheetTable): Reflection[] {
  return rows(table, (get, row) => {
    const url = safeUrl(get('url'))
    if (!get('id') || !get('tema_id') || !url) return null
    return {
      id: get('id'),
      temaId: get('tema_id'),
      usuario: normalizeUsername(get('usuario')),
      titulo: get('titulo') || url,
      url,
      creado: get('creado'),
      rowNumber: row.rowNumber,
    }
  }).sort((a, b) => (a.creado < b.creado ? -1 : 1))
}

export function parseConfig(table: SheetTable): AppConfig {
  const map = new Map<string, string>()
  for (const row of table.rows) map.set(cell(table, row, 'clave').toLowerCase(), cell(table, row, 'valor'))
  return {
    driveUrl: safeUrl(map.get('drive_url') ?? ''),
    lugarDefecto: map.get('lugar_defecto') || 'Bar Trinidad',
    horaDefecto: map.get('hora_defecto') || '21:00',
    mapsUrl: safeUrl(map.get('maps_url') ?? ''),
    ciudad: map.get('ciudad') ?? '',
  }
}

export interface AppData {
  topics: Topic[]
  users: User[]
  attendance: Attendance[]
  reflections: Reflection[]
  config: AppConfig
}

export function parseWorkbook(wb: Workbook): AppData {
  return {
    topics: parseTopics(wb.TEMAS),
    users: parseUsers(wb.USUARIOS),
    attendance: parseAttendance(wb.ASISTENCIA),
    reflections: parseReflections(wb.REFLEXIONES),
    config: parseConfig(wb.CONFIG),
  }
}

/** Próximo encuentro: el publicado más cercano con fecha de hoy en adelante. */
export function upcomingTopic(topics: Topic[], today: string): Topic | undefined {
  return topics.filter((t) => t.publicado && t.fecha >= today).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))[0]
}

export function isOpenForRsvp(topic: Topic, today: string): boolean {
  return topic.publicado && topic.fecha >= today
}

/** Id nuevo a partir de la fecha; si ya hay otro tema ese día, añade -2, -3… */
export function newTopicId(fecha: string, existing: string[]): string {
  if (!existing.includes(fecha)) return fecha
  let n = 2
  while (existing.includes(`${fecha}-${n}`)) n++
  return `${fecha}-${n}`
}
