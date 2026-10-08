import 'server-only'
import { cache } from 'react'
import { getStore } from '@/lib/store'
import { parseWorkbook, type AppData } from '@/lib/domain/model'

/** Datos de la petición actual (una sola lectura del Sheet por petición, con caché corta). */
export const getAppData = cache(async (): Promise<AppData> => parseWorkbook(await getStore().read()))

/** Lectura sin caché, para las escrituras. Devuelve también el libro crudo para construir filas. */
export async function readFresh() {
  const workbook = await getStore().read({ fresh: true })
  return { workbook, data: parseWorkbook(workbook) }
}

export function displayNames(data: AppData): Map<string, string> {
  return new Map(data.users.map((u) => [u.usuario, u.nombre]))
}
