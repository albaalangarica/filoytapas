'use client'

import { useActionState, useEffect, useRef } from 'react'
import { proposeTopic } from '@/lib/actions/member'
import { initialFormState } from '@/lib/actions/state'
import { SubmitButton } from './SubmitButton'
import { Field, Notice, inputStyles } from './ui'

/** Bloque para que cualquier miembro proponga un tema para una próxima sesión. */
export function ProposeTopic() {
  const [state, action] = useActionState(proposeTopic, initialFormState)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  return (
    <section className="rounded-card border border-cobalt-100 bg-gradient-to-br from-cobalt-50 to-white p-5">
      <h2 className="font-display text-xl font-extrabold text-navy">💡 Propón un tema</h2>
      <p className="mt-1 text-sm text-muted">¿Algo que te gustaría charlar un jueves? Martina y Juanma lo verán.</p>
      <form ref={formRef} action={action} className="mt-4 flex flex-col gap-4">
        <Field label="Tema" htmlFor="p-titulo">
          <input id="p-titulo" name="titulo" required maxLength={140} className={inputStyles} placeholder="Ej.: ¿Es libre quien no puede desconectarse?" />
        </Field>
        <Field label="¿Por qué te interesa? (opcional)" htmlFor="p-descripcion" hint="Una idea, una noticia, preguntas que se te ocurran…">
          <textarea id="p-descripcion" name="descripcion" rows={3} maxLength={2000} className={inputStyles} />
        </Field>
        {state.error ? <Notice kind="error">{state.error}</Notice> : null}
        {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
        <SubmitButton pendingText="Enviando…">Enviar propuesta</SubmitButton>
      </form>
    </section>
  )
}
