import { longDate } from '@/lib/domain/dates'
import type { Topic } from '@/lib/domain/model'

/** Texto de la convocatoria para pegar en WhatsApp. */
export function shareText(topic: Topic): string {
  const lines = [`*${topic.titulo}*`]
  if (topic.cita) lines.push('', `“${topic.cita}”`)
  lines.push('', `📅 ${longDate(topic.fecha)} · ${topic.hora}`, `📍 ${topic.lugar}`)
  if (topic.llamada) lines.push('', topic.llamada)
  return lines.join('\n')
}
