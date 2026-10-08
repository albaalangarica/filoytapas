'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addReflection, editReflection } from '@/lib/actions/member'
import { initialFormState } from '@/lib/actions/state'
import { Icon } from './Icon'
import { SubmitButton } from './SubmitButton'
import { Field, Notice, buttonStyles, inputStyles } from './ui'

export function AddReflection({ temaId, compact = false }: { temaId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(addReflection, initialFormState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      // eslint-disable-next-line react-hooks/set-state-in-effect -- cerrar el formulario tras publicar
      setOpen(false)
    }
  }, [state])

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            compact
              ? 'inline-flex items-center gap-1.5 self-start text-sm font-bold text-terra-700 hover:underline'
              : 'flex items-center justify-center gap-2 rounded-full border-2 border-dashed border-terra/50 px-4 py-3.5 font-bold text-terra-700 hover:bg-terra-50'
          }
        >
          <Icon name="plus" className="size-4" /> Añadir mi aportación
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 rounded-card border border-line bg-white p-4">
      <input type="hidden" name="temaId" value={temaId} />
      <Field label="¿Qué te llevas de la sesión?" htmlFor={`r-texto-${temaId}`} hint="Lo verá todo el grupo.">
        <textarea
          id={`r-texto-${temaId}`}
          name="texto"
          required
          rows={5}
          maxLength={2000}
          className={inputStyles}
          placeholder="Una idea, una duda, algo que te hizo cambiar de opinión…"
        />
      </Field>
      <Field label="Enlace (opcional)" htmlFor={`r-url-${temaId}`} hint="Un artículo, un vídeo, un audio…">
        <input id={`r-url-${temaId}`} name="url" type="url" inputMode="url" className={inputStyles} placeholder="https://" />
      </Field>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      <div className="flex gap-2">
        <SubmitButton pendingText="Publicando…" className="flex-1">
          Publicar
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function EditReflection({ id, texto, url, onDone }: { id: string; texto: string; url: string; onDone: () => void }) {
  const [state, action] = useActionState(editReflection, initialFormState)
  useEffect(() => {
    if (state.ok) onDone()
  }, [state, onDone])
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <textarea aria-label="Aportación" name="texto" defaultValue={texto} required rows={5} maxLength={2000} className={inputStyles} />
      <input aria-label="Enlace (opcional)" name="url" type="url" defaultValue={url} placeholder="https:// (opcional)" className={inputStyles} />
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      <div className="flex gap-2">
        <SubmitButton pendingText="Guardando…" className="flex-1 py-2.5">
          Guardar
        </SubmitButton>
        <button type="button" onClick={onDone} className={buttonStyles.ghost}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
