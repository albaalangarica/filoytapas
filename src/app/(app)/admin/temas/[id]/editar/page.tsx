import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageTitle } from '@/components/ui'
import { requireAdmin } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { TopicForm } from '../../../AdminForms'

export const metadata: Metadata = { title: 'Editar tema' }

export default async function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const topic = (await getAppData()).topics.find((t) => t.id === decodeURIComponent(id))
  if (!topic) notFound()
  return (
    <>
      <PageTitle eyebrow="Admin" title="Editar tema" />
      <TopicForm
        initial={{
          id: topic.id,
          titulo: topic.titulo,
          cita: topic.cita,
          introduccion: topic.introduccion,
          preguntas: topic.preguntas.join('\n'),
          fecha: topic.fecha,
          hora: topic.hora,
          lugar: topic.lugar,
          llamada: topic.llamada,
          materiales_url: topic.materialesUrl,
          publicado: topic.publicado,
        }}
      />
    </>
  )
}
