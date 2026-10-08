'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { addReflection, editReflection } from '@/lib/actions/member'
import { initialFormState } from '@/lib/actions/state'
import { Icon } from './Icon'
import { SubmitButton } from './SubmitButton'
import { Field, Notice, buttonStyles, inputStyles } from './ui'

export function AddReflection({ temaId }: { temaId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(addReflection, initialFormState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cobalt px-4 py-3.5 font-bold text-cobalt hover:bg-cobalt-50"
        >
          <Icon name="plus" /> Añadir mi reflexión
        </button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 rounded-card border border-line bg-mist p-4">
      <input type="hidden" name="temaId" value={temaId} />
      <Field label="Título" htmlFor="r-titulo" hint="Una frase que invite a leerla.">
        <input id="r-titulo" name="titulo" required maxLength={120} className={inputStyles} placeholder="Por qué el control de alquileres no basta" />
      </Field>
      <Field label="Enlace" htmlFor="r-url" hint="Un artículo, un documento, un post, un audio…">
        <input id="r-url" name="url" type="url" inputMode="url" required className={inputStyles} placeholder="https://" />
      </Field>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
      <div className="flex gap-2">
        <SubmitButton pendingText="Guardando…" className="flex-1">
          Publicar reflexión
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className={buttonStyles.ghost}>
          Cerrar
        </button>
      </div>
    </form>
  )
}

export function EditReflection({ id, titulo, url, onDone }: { id: string; titulo: string; url: string; onDone: () => void }) {
  const [state, action] = useActionState(editReflection, initialFormState)
  useEffect(() => {
    if (state.ok) onDone()
  }, [state, onDone])
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <input aria-label="Título" name="titulo" defaultValue={titulo} required maxLength={120} className={inputStyles} />
      <input aria-label="Enlace" name="url" type="url" defaultValue={url} required className={inputStyles} />
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
