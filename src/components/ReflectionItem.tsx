'use client'

import { useCallback, useState } from 'react'
import { deleteReflection } from '@/lib/actions/member'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { EditReflection } from './ReflectionForm'
import { SubmitButton } from './SubmitButton'

export function ReflectionItem({
  id,
  titulo,
  url,
  usuario,
  nombre,
  canEdit,
  canDelete,
}: {
  id: string
  titulo: string
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
    host = new URL(url).hostname.replace(/^www\./, '')
  } catch {}

  return (
    <li className="rounded-card border border-line bg-paper p-4">
      {mode === 'edit' ? (
        <EditReflection id={id} titulo={titulo} url={url} onDone={done} />
      ) : (
        <div className="flex items-start gap-3">
          <Avatar usuario={usuario} nombre={nombre} />
          <div className="min-w-0 flex-1">
            <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="group block">
              <span className="font-display text-base font-bold leading-snug group-hover:text-cobalt group-hover:underline">{titulo}</span>
              <span className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                {nombre} · {host}
                <Icon name="external" className="size-3.5" />
              </span>
            </a>
            {mode === 'confirm' ? (
              <form action={deleteReflection} className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <input type="hidden" name="id" value={id} />
                <span className="font-semibold">¿Borrar esta reflexión?</span>
                <SubmitButton variant="danger" pendingText="Borrando…" className="py-1.5">
                  Sí, borrar
                </SubmitButton>
                <button type="button" onClick={done} className="px-2 py-1.5 font-semibold text-muted">
                  No
                </button>
              </form>
            ) : canEdit || canDelete ? (
              <div className="mt-2 flex gap-3 text-sm font-semibold">
                {canEdit ? (
                  <button type="button" onClick={() => setMode('edit')} className="flex items-center gap-1 text-cobalt">
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
          </div>
        </div>
      )}
    </li>
  )
}
