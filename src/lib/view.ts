import type { AppData, Answer, Reflection, Topic } from '@/lib/domain/model'

/* Vistas derivadas para las pantallas: quién va, cuántas reflexiones, qué ha respondido cada uno. */

export interface Person {
  usuario: string
  nombre: string
}

export interface TopicSummary {
  topic: Topic
  going: Person[]
  notGoing: Person[]
  reflections: (Reflection & { nombre: string })[]
  myAnswer: Answer | null
}

export function summarize(data: AppData, topic: Topic, me: string): TopicSummary {
  const names = new Map(data.users.map((u) => [u.usuario, u.nombre]))
  const person = (usuario: string): Person => ({ usuario, nombre: names.get(usuario) ?? usuario })
  const answers = data.attendance.filter((a) => a.temaId === topic.id)
  return {
    topic,
    going: answers.filter((a) => a.respuesta === 'voy').map((a) => person(a.usuario)),
    notGoing: answers.filter((a) => a.respuesta === 'no').map((a) => person(a.usuario)),
    reflections: data.reflections.filter((r) => r.temaId === topic.id).map((r) => ({ ...r, nombre: names.get(r.usuario) ?? r.usuario })),
    myAnswer: answers.find((a) => a.usuario === me)?.respuesta ?? null,
  }
}

/** Temas visibles para este usuario: los publicados, y también borradores si es admin. */
export function visibleTopics(data: AppData, isAdmin: boolean): Topic[] {
  return data.topics.filter((t) => t.publicado || isAdmin)
}
