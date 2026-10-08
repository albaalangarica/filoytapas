import 'server-only'
import { hashPassword } from '@/lib/auth/password'
import { SHEETS, SHEET_NAMES, toTable, type SheetName, type Store, type Workbook } from './types'

/*
 * Almacén en memoria para el modo demo y el desarrollo local sin credenciales de Google.
 * Se reinicia al reiniciar el servidor. Todas las cuentas demo usan la contraseña "filoytapas".
 */

type Raw = Record<SheetName, string[][]>

const DEMO_PASSWORD = 'filoytapas'

function seed(): Raw {
  const hash = hashPassword(DEMO_PASSWORD)
  const now = new Date().toISOString()
  return {
    TEMAS: [
      [...SHEETS.TEMAS],
      [
        '2026-10-01', '2026-10-01', '21:00', 'Bar Trinidad', 'CRISIS DE VIVIENDA',
        'Maricarmen no se va. Decreto Maricarmen. Sindicato de inquilinas.',
        'Basta con abrir las noticias o cualquier red social para ver que la sociedad está gritando “basta ya”. Y es que vivimos en una sociedad en la que, la vivienda junto a la inmigración está siendo el tema que decide las elecciones.\n\nHoy, como buen filo y tapas con vocación de arreglar el mundo, lo traemos a la mesa, con algunas preguntas fundamentales.',
        [
          '¿Debe de ser la vivienda un derecho?',
          'Si la vivienda es un derecho, ¿quién tiene la obligación de garantizarlo?',
          '¿Es moral tener casas vacías, y gente en la calle?',
          '¿Hasta dónde llega el derecho a la propiedad privada?',
          '¿Tengo derecho a hacer con mi casa absolutamente lo que quiera?',
          '¿Es legítimo limitar el precio al que alguien puede alquilar una propiedad que le pertenece?',
          '¿Tenemos derecho a permanecer en nuestra ciudad cuando es ésta la que cambia?',
          '¿Es realmente un problema de vivienda o también un problema de desigualdad entre generaciones?',
          '¿Qué medidas crees que podrían ayudar a solucionar esta situación?',
        ].join('\n'),
        '¿Te veremos hoy por allí?', '', 'Martina', 'sí',
      ],
      [
        '2026-10-08', '2026-10-08', '21:00', 'Bar Trinidad', 'PODER: ¿QUIÉN MANDA REALMENTE?',
        'Vivimos en democracia.',
        'Pero, más allá de votar cada cuatro años, ¿quién tiene realmente el poder?\n\nCuando pensamos en poder pensamos en gobiernos, políticos o grandes empresarios. Pero ¿son realmente ellos quienes deciden? ¿O vivimos cada vez más en una sociedad gobernada por expertos, técnicos, algoritmos, grandes empresas y organismos que toman decisiones que afectan a nuestras vidas?',
        [
          '¿Vivimos en una democracia o en una tecnocracia?',
          '¿Quién decide qué problemas son importantes y qué soluciones son posibles?',
          'Y nosotros, ¿tenemos realmente algún poder?',
          '¿Es poder elegir entre las opciones que nos ofrecen, o el verdadero poder está en decidir cuáles son esas opciones?',
        ].join('\n'),
        '¿Contamos contigo?', '', 'Juanma', 'sí',
      ],
    ],
    ASISTENCIA: [
      [...SHEETS.ASISTENCIA],
      ['2026-10-01', 'martina', 'voy', now],
      ['2026-10-01', 'juanma', 'voy', now],
      ['2026-10-01', 'alba', 'voy', now],
      ['2026-10-08', 'martina', 'voy', now],
      ['2026-10-08', 'juanma', 'voy', now],
      ['2026-10-08', 'pedro', 'no', now],
    ],
    REFLEXIONES: [
      [...SHEETS.REFLEXIONES],
      ['demo-r1', '2026-10-01', 'juanma', '', 'https://example.com/alquiler', now, '', 'Me quedo con la idea de que limitar el precio sin construir más solo reparte la escasez. Os dejo un artículo que lo explica bien.'],
      ['demo-r2', '2026-10-01', 'martina', '', '', now, '', '¿Tenemos derecho a quedarnos en nuestra ciudad cuando ella cambia? Creo que la pregunta de fondo fue la brecha entre generaciones, no la vivienda.'],
    ],
    USUARIOS: [
      [...SHEETS.USUARIOS],
      ['martina', 'Martina', hash, 'admin', 'activo', now, '1'],
      ['juanma', 'Juanma', hash, 'admin', 'activo', now, '1'],
      ['alba', 'Alba', hash, 'miembro', 'activo', now, '1'],
      ['pedro', 'Pedro', hash, 'miembro', 'activo', now, '1'],
      ['lucia', 'Lucía', hash, 'miembro', 'pendiente', now, '1'],
    ],
    CUENTAS: [
      [...SHEETS.CUENTAS],
      ['2026-10-01', 'martina', '12,50', 'sí', now],
      ['2026-10-01', 'juanma', '12,50', 'no', now],
      ['2026-10-01', 'alba', '12,50', 'no', now],
    ],
    PROPUESTAS: [
      [...SHEETS.PROPUESTAS],
      ['demo-p1', 'alba', 'Inteligencia artificial: ¿quién es responsable?', 'Si una IA decide mal, ¿la culpa es de quien la programa, de quien la usa o de nadie?', 'nueva', now],
    ],
    CONFIG: [
      [...SHEETS.CONFIG],
      ['drive_url', 'https://drive.google.com/', 'Enlace a la carpeta de Drive con los materiales'],
      ['lugar_defecto', 'Bar Trinidad', 'Lugar que aparece ya puesto al crear un tema'],
      ['hora_defecto', '21:00', 'Hora que aparece ya puesta al crear un tema'],
      ['maps_url', '', 'Enlace de Google Maps del bar habitual'],
      ['ciudad', '', 'Ciudad donde se celebra'],
    ],
  }
}

const globalRef = globalThis as unknown as { __filoytapasDemo?: Raw }

function data(): Raw {
  globalRef.__filoytapasDemo ??= seed()
  return globalRef.__filoytapasDemo
}

export const memoryStore: Store = {
  async read(): Promise<Workbook> {
    const raw = data()
    const workbook = {} as Workbook
    for (const name of SHEET_NAMES) workbook[name] = toTable(raw[name].map((row) => [...row]))
    return workbook
  },
  async append(sheet, values) {
    data()[sheet].push([...values])
  },
  async appendMany(sheet, rows) {
    for (const row of rows) data()[sheet].push([...row])
  },
  async updateMany(sheet, updates) {
    for (const u of updates) data()[sheet][u.rowNumber - 1] = [...u.values]
  },
  async update(sheet, rowNumber, values) {
    data()[sheet][rowNumber - 1] = [...values]
  },
  async clear(sheet, rowNumber) {
    const rows = data()[sheet]
    if (rows[rowNumber - 1]) rows[rowNumber - 1] = rows[rowNumber - 1]!.map(() => '')
  },
}

/** Solo para tests: vuelve a los datos iniciales. */
export function resetDemoStore() {
  globalRef.__filoytapasDemo = seed()
}
