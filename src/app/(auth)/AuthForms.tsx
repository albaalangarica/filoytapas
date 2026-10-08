'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login, requestAccess } from '@/lib/actions/auth'
import { initialFormState } from '@/lib/actions/state'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, Notice, inputStyles } from '@/components/ui'

export function LoginForm({ next, demo }: { next: string; demo: boolean }) {
  const [state, action] = useActionState(login, initialFormState)
  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <input type="hidden" name="next" value={next} />
      <Field label="Usuario" htmlFor="usuario">
        <input id="usuario" name="usuario" autoComplete="username" autoCapitalize="none" spellCheck={false} required className={inputStyles} />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputStyles} />
      </Field>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      <SubmitButton pendingText="Entrando…">Entrar</SubmitButton>
      <p className="text-center text-sm text-muted">
        ¿Primera vez?{' '}
        <Link href="/solicitar" className="font-bold text-cobalt">
          Solicitar acceso
        </Link>
      </p>
      <p className="text-center text-xs text-muted">¿Has olvidado la contraseña? Pide a Martina o Juanma una nueva.</p>
      {demo ? (
        <p className="rounded-xl bg-mandarin-50 px-3 py-2 text-center text-xs text-mandarin-700">
          Modo demo · usuario <b>martina</b> (admin) o <b>alba</b> · contraseña <b>filoytapas</b>
        </p>
      ) : null}
    </form>
  )
}

export function RequestAccessForm() {
  const [state, action] = useActionState(requestAccess, initialFormState)
  if (state.ok) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">¡Hecho! 🍻</h1>
        <Notice kind="ok">{state.ok}</Notice>
        <Link href="/entrar" className="text-center font-bold text-cobalt">
          Volver a entrar
        </Link>
      </div>
    )
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Solicitar acceso</h1>
      <p className="-mt-2 text-sm text-muted">Martina o Juanma aprobarán tu cuenta.</p>
      <Field label="Tu nombre" htmlFor="nombre" hint="Así te verá el resto en la lista de asistentes.">
        <input id="nombre" name="nombre" autoComplete="given-name" required maxLength={40} className={inputStyles} />
      </Field>
      <Field label="Nombre de usuario" htmlFor="usuario" hint="Para entrar. Letras sin tildes, números, punto o guion bajo.">
        <input id="usuario" name="usuario" autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={20} pattern="[A-Za-z0-9._]{3,20}" className={inputStyles} />
      </Field>
      <Field label="Contraseña" htmlFor="password" hint="Mínimo 8 caracteres.">
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={inputStyles} />
      </Field>
      <Field label="Repite la contraseña" htmlFor="password2">
        <input id="password2" name="password2" type="password" autoComplete="new-password" required minLength={8} className={inputStyles} />
      </Field>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      <SubmitButton pendingText="Enviando…">Enviar solicitud</SubmitButton>
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/entrar" className="font-bold text-cobalt">
          Entrar
        </Link>
      </p>
    </form>
  )
}
