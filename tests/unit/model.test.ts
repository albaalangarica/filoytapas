import { describe, expect, it } from 'vitest'
import { isOpenForContributions, isOpenForRsvp, newTopicId, parseAttendance, parseConfig, parseReflections, parseTopics, parseUsers, upcomingTopic } from '@/lib/domain/model'
import { buildRow, toTable } from '@/lib/store/types'

const temas = toTable([
  ['id', 'fecha', 'hora', 'lugar', 'titulo', 'cita', 'introduccion', 'preguntas', 'llamada', 'materiales_url', 'autor', 'publicado'],
  ['2026-10-01', '1/10/2026', '21:00', 'Bar Trinidad', 'CRISIS DE VIVIENDA', '“Maricarmen no se va.”', 'Intro', '¿Uno?\n\n ¿Dos? ', '', 'javascript:alert(1)', 'Martina', 'sí'],
  [],
  ['2026-10-08', '2026-10-08', '21:00', 'Bar Trinidad', 'PODER', '', '', '', '', 'https://drive.google.com/x', 'Juanma', 'TRUE'],
  ['46310', '46310', '0,875', 'Bar Trinidad', 'SERIAL', '', '', '', '', '', 'Juanma', 'no'],
  ['borrador', '2026-10-16', '21:00', 'Bar Trinidad', 'BORRADOR', '', '', '', '', '', 'Juanma', 'no'],
])

describe('lectura del Sheet', () => {
  it('lee temas, normaliza fechas, quita comillas y descarta enlaces peligrosos', () => {
    const topics = parseTopics(temas)
    expect(topics.map((t) => t.id)).toEqual(['borrador', '2026-10-15', '2026-10-08', '2026-10-01'])
    expect(topics.find((t) => t.titulo === 'SERIAL')).toMatchObject({ id: '2026-10-15', fecha: '2026-10-15', hora: '21:00' })
    const vivienda = topics.find((t) => t.id === '2026-10-01')!
    expect(vivienda.fecha).toBe('2026-10-01')
    expect(vivienda.cita).toBe('Maricarmen no se va.')
    expect(vivienda.preguntas).toEqual(['¿Uno?', '¿Dos?'])
    expect(vivienda.materialesUrl).toBe('')
    expect(vivienda.rowNumber).toBe(2)
    expect(topics.find((t) => t.id === '2026-10-08')!.rowNumber).toBe(4)
  })

  it('el próximo encuentro es el publicado más cercano desde hoy', () => {
    const topics = parseTopics(temas)
    expect(upcomingTopic(topics, '2026-10-02')?.id).toBe('2026-10-08')
    expect(upcomingTopic(topics, '2026-10-09')).toBeUndefined()
    expect(isOpenForRsvp(topics.find((t) => t.id === '2026-10-01')!, '2026-10-02')).toBe(false)
  })

  it('lee usuarios con valores por defecto seguros', () => {
    const users = parseUsers(
      toTable([
        ['usuario', 'nombre', 'password_hash', 'rol', 'estado', 'creado', 'sesion'],
        [' Martina ', 'Martina', 'h', 'Admin', 'activo', '', '3'],
        ['raro', '', 'h', 'jefe', 'loquesea', '', ''],
      ]),
    )
    expect(users[0]).toMatchObject({ usuario: 'martina', rol: 'admin', estado: 'activo', sesion: 3 })
    expect(users[1]).toMatchObject({ nombre: 'raro', rol: 'miembro', estado: 'pendiente', sesion: 1 })
  })

  it('ignora asistencias y reflexiones mal formadas', () => {
    const att = parseAttendance(toTable([['tema_id', 'usuario', 'respuesta'], ['t', 'a', 'voy'], ['t', 'b', 'quizá']]))
    expect(att).toHaveLength(1)
    const refl = parseReflections(
      toTable([
        ['id', 'tema_id', 'usuario', 'titulo', 'url', 'texto'],
        ['1', 't', 'a', '', 'https://x.es', 'Lo que pienso'],
        ['2', 't', 'a', 'antigua', 'https://y.es', ''],
        ['3', 't', 'a', '', 'ftp://x', ''],
        ['4', 't', 'a', '', '', 'Solo texto'],
      ]),
    )
    expect(refl.map((r) => r.id)).toEqual(['1', '2', '4'])
    expect(refl.find((r) => r.id === '2')?.texto).toBe('antigua')
    expect(refl.find((r) => r.id === '4')?.url).toBe('')
  })

  it('las aportaciones se abren cuando empieza la sesión', () => {
    const poder = parseTopics(temas).find((t) => t.id === '2026-10-08')!
    expect(isOpenForContributions(poder, '2026-10-08 20:59')).toBe(false)
    expect(isOpenForContributions(poder, '2026-10-08 21:00')).toBe(true)
    expect(isOpenForContributions(poder, '2026-10-09 10:00')).toBe(true)
    const borrador = parseTopics(temas).find((t) => t.id === 'borrador')!
    expect(isOpenForContributions(borrador, '2027-01-01 00:00')).toBe(false)
  })

  it('lee la configuración', () => {
    const config = parseConfig(toTable([['clave', 'valor'], ['drive_url', 'https://drive.google.com/a'], ['hora_defecto', '20:30']]))
    expect(config).toMatchObject({ driveUrl: 'https://drive.google.com/a', horaDefecto: '20:30', lugarDefecto: 'Bar Trinidad' })
  })

  it('genera ids únicos por fecha', () => {
    expect(newTopicId('2026-10-15', ['2026-10-08'])).toBe('2026-10-15')
    expect(newTopicId('2026-10-15', ['2026-10-15', '2026-10-15-2'])).toBe('2026-10-15-3')
  })

  it('construye filas respetando el orden de columnas y lo que no conoce', () => {
    const table = toTable([['b', 'a', 'extra']])
    expect(buildRow(table, { a: '1', b: '2', nope: 'x' }, ['', '', 'nota'])).toEqual(['2', '1', 'nota'])
  })
})

describe('cuentas', () => {
  it('lee importes en formato español y descarta los mal escritos', async () => {
    const { parseDebts } = await import('@/lib/domain/model')
    const debts = parseDebts(
      toTable([
        ['tema_id', 'usuario', 'importe', 'pagado'],
        ['2026-10-01', 'Alba', '12,50', 'sí'],
        ['2026-10-01', 'juanma', '8.5 €', ''],
        ['2026-10-01', 'pedro', 'mucho', 'no'],
      ]),
    )
    expect(debts.map((d) => [d.usuario, d.importe, d.pagado])).toEqual([
      ['alba', 1250, true],
      ['juanma', 850, false],
    ])
  })
})
