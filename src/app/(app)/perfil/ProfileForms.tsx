'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changePassword } from '@/lib/actions/auth'
import { initialFormState } from '@/lib/actions/state'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, Notice, inputStyles } from '@/components/ui'

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, initialFormState)
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) ref.current?.reset()
  }, [state])
  return (
    <form ref={ref} action={action} className="flex flex-col gap-4">
      <input type="text" name="usuario" autoComplete="username" hidden readOnly />
      <Field label="Contraseña actual" htmlFor="actual" hint="Si te la ha reseteado un admin, es la provisional que te pasaron.">
        <input id="actual" name="actual" type="password" autoComplete="current-password" required className={inputStyles} />
      </Field>
      <Field label="Nueva contraseña" htmlFor="nueva" hint="Mínimo 8 caracteres.">
        <input id="nueva" name="nueva" type="password" autoComplete="new-password" required minLength={8} className={inputStyles} />
      </Field>
      <Field label="Repite la nueva" htmlFor="nueva2">
        <input id="nueva2" name="nueva2" type="password" autoComplete="new-password" required minLength={8} className={inputStyles} />
      </Field>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      {state.ok ? <Notice kind="ok">{state.ok}</Notice> : null}
      <SubmitButton variant="secondary" pendingText="Guardando…">
        Cambiar contraseña
      </SubmitButton>
    </form>
  )
}
