import { describe, expect, it } from 'vitest'
import { isOpenForRsvp, newTopicId, parseAttendance, parseConfig, parseReflections, parseTopics, parseUsers, upcomingTopic } from '@/lib/domain/model'
import { buildRow, toTable } from '@/lib/store/types'

const temas = toTable([
  ['id', 'fecha', 'hora', 'lugar', 'titulo', 'cita', 'introduccion', 'preguntas', 'llamada', 'materiales_url', 'autor', 'publicado'],
  ['2026-10-01', '1/10/2026', '21:00', 'Bar Trinidad', 'CRISIS DE VIVIENDA', '“Maricarmen no se va.”', 'Intro', '¿Uno?\n\n ¿Dos? ', '', 'javascript:alert(1)', 'Martina', 'sí'],
  [],
  ['2026-10-08', '2026-10-08', '21:00', 'Bar Trinidad', 'PODER', '', '', '', '', 'https://drive.google.com/x', 'Juanma', 'TRUE'],
  ['borrador', '2026-10-15', '21:00', 'Bar Trinidad', 'BORRADOR', '', '', '', '', '', 'Juanma', 'no'],
])

describe('lectura del Sheet', () => {
  it('lee temas, normaliza fechas, quita comillas y descarta enlaces peligrosos', () => {
    const topics = parseTopics(temas)
    expect(topics.map((t) => t.id)).toEqual(['borrador', '2026-10-08', '2026-10-01'])
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
    const refl = parseReflections(toTable([['id', 'tema_id', 'usuario', 'titulo', 'url'], ['1', 't', 'a', 'ok', 'https://x.es'], ['2', 't', 'a', 'mal', 'ftp://x']]))
    expect(refl.map((r) => r.id)).toEqual(['1'])
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
