'use client'

import { useCallback, useState } from 'react'
import { deleteReflection } from '@/lib/actions/member'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { EditReflection } from './ReflectionForm'
import { SubmitButton } from './SubmitButton'

export function ReflectionItem({
  id,
  texto,
  url,
  usuario,
  nombre,
  canEdit,
  canDelete,
}: {
  id: string
  texto: string
  url: string
  usuario: string
  nombre: string
  canEdit: boolean
  canDelete: boolean
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view')
  const done = useCallback(() => setMode('view'), [])
  let host = ''
  try {
    host = url ? new URL(url).hostname.replace(/^www\./, '') : ''
  } catch {}

  return (
    <li className="rounded-card border border-line bg-white p-4">
      <div className="flex items-center gap-2.5">
        <Avatar usuario={usuario} nombre={nombre} size="sm" />
        <span className="font-bold">{nombre}</span>
      </div>
      {mode === 'edit' ? (
        <div className="mt-3">
          <EditReflection id={id} texto={texto} url={url} onDone={done} />
        </div>
      ) : (
        <>
          <p className="mt-2.5 whitespace-pre-line leading-relaxed">{texto}</p>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-mandarin-700 hover:bg-mandarin-50"
            >
              <Icon name="external" className="size-4 shrink-0" />
              <span className="truncate">{host || 'Abrir enlace'}</span>
            </a>
          ) : null}
          {mode === 'confirm' ? (
            <form action={deleteReflection} className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <input type="hidden" name="id" value={id} />
              <span className="font-semibold">¿Borrar esta aportación?</span>
              <SubmitButton variant="danger" pendingText="Borrando…" className="py-1.5">
                Sí, borrar
              </SubmitButton>
              <button type="button" onClick={done} className="px-2 py-1.5 font-semibold text-muted">
                No
              </button>
            </form>
          ) : canEdit || canDelete ? (
            <div className="mt-3 flex gap-4 text-sm font-semibold">
              {canEdit ? (
                <button type="button" onClick={() => setMode('edit')} className="flex items-center gap-1 text-cobalt-700">
                  <Icon name="edit" className="size-4" /> Editar
                </button>
              ) : null}
              {canDelete ? (
                <button type="button" onClick={() => setMode('confirm')} className="flex items-center gap-1 text-danger">
                  <Icon name="trash" className="size-4" /> Borrar
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </li>
  )
}
