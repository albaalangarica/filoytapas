import type { Metadata } from 'next'
import { PageTitle } from '@/components/ui'
import { requireAdmin } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { nextThursday, todayInMadrid } from '@/lib/domain/dates'
import { TopicForm } from '../../AdminForms'

export const metadata: Metadata = { title: 'Nueva sesión' }

export default async function NewTopicPage({ searchParams }: { searchParams: Promise<{ propuesta?: string }> }) {
  await requireAdmin()
  const { config, proposals } = await getAppData()
  const { propuesta } = await searchParams
  const proposal = proposals.find((p) => p.id === propuesta)
  return (
    <>
      <PageTitle eyebrow="Admin" title="Nueva sesión" />
      <TopicForm
        initial={{
          propuesta: proposal?.id,
          titulo: proposal?.titulo.toUpperCase() ?? '',
          cita: '',
          introduccion: proposal?.descripcion ?? '',
          preguntas: '',
          fecha: nextThursday(todayInMadrid()),
          hora: config.horaDefecto,
          lugar: config.lugarDefecto,
          llamada: '¿Contamos contigo?',
          materiales_url: '',
          publicado: true,
        }}
      />
    </>
  )
}
