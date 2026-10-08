import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { Empty, PageTitle, SectionTitle } from '@/components/ui'
import { requireUser } from '@/lib/auth/session'
import { getAppData } from '@/lib/data'
import { longDate } from '@/lib/domain/dates'
import { visibleTopics } from '@/lib/view'

export const metadata: Metadata = { title: 'Materiales' }

export default async function MaterialsPage() {
  const me = await requireUser()
  const data = await getAppData()
  const withMaterials = visibleTopics(data, me.rol === 'admin').filter((t) => t.materialesUrl)

  return (
    <>
      <PageTitle eyebrow="Para leer, ver y escuchar" title="Materiales">
        Lecturas, vídeos y audios que vamos subiendo a la carpeta compartida.
      </PageTitle>
      {data.config.driveUrl ? (
        <a
          href={data.config.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-card bg-cobalt p-5 text-white transition hover:bg-cobalt-700"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
            <Icon name="folder" className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-lg font-extrabold">Carpeta de materiales</span>
            <span className="text-sm text-cobalt-100">Abrir en Google Drive</span>
          </span>
          <Icon name="external" />
        </a>
      ) : (
        <Empty title="Falta el enlace de la carpeta">
          {me.rol === 'admin' ? 'Añádelo en la pestaña CONFIG del Sheet (fila drive_url).' : 'Pronto estará aquí.'}
        </Empty>
      )}

      {withMaterials.length > 0 ? (
        <>
          <SectionTitle>Por jueves</SectionTitle>
          <ul className="flex flex-col gap-2">
            {withMaterials.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jueves/${encodeURIComponent(t.id)}`} className="block truncate font-display font-bold hover:text-cobalt">
                    {t.titulo}
                  </Link>
                  <span className="text-xs text-muted">{longDate(t.fecha)}</span>
                </div>
                <a href={t.materialesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-cobalt hover:bg-cobalt-50">
                  Abrir <Icon name="external" className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  )
}
