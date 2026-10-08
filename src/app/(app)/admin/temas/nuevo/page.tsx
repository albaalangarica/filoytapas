import type { Metadata } from 'next'
import { PageTitle } from '@/components/ui'
import { requireAdmin } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { nextThursday, todayInMadrid } from '@/lib/domain/dates'
import { TopicForm } from '../../AdminForms'

export const metadata: Metadata = { title: 'Nuevo tema' }

export default async function NewTopicPage() {
  await requireAdmin()
  const { config } = await getAppData()
  return (
    <>
      <PageTitle eyebrow="Admin" title="Nuevo tema" />
      <TopicForm
        initial={{
          titulo: '',
          cita: '',
          introduccion: '',
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
