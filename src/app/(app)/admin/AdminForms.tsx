'use client'

import { useActionState, useState } from 'react'
import { resetPassword, saveTopic } from '@/lib/actions/admin'
import { initialFormState } from '@/lib/actions/state'
import { SubmitButton } from '@/components/SubmitButton'
import { Field, Notice, buttonStyles, inputStyles } from '@/components/ui'

export function ResetPasswordButton({ usuario }: { usuario: string }) {
  const [state, action] = useActionState(resetPassword, initialFormState)
  const [confirm, setConfirm] = useState(false)
  if (state.secret) {
    return (
      <div className="mt-3 rounded-xl bg-ok-50 p-3 text-sm text-ok">
        <p className="font-semibold">{state.ok}</p>
        <p className="mt-1 select-all font-mono text-base font-bold text-ink">{state.secret}</p>
      </div>
    )
  }
  if (!confirm) {
    return (
      <button type="button" onClick={() => setConfirm(true)} className="text-sm font-semibold text-cobalt">
        Resetear contraseña
      </button>
    )
  }
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 text-sm">
      <input type="hidden" name="usuario" value={usuario} />
      <span className="font-semibold">¿Generar una contraseña nueva?</span>
      <SubmitButton variant="secondary" pendingText="Generando…" className="px-3 py-1.5">
        Sí
      </SubmitButton>
      <button type="button" onClick={() => setConfirm(false)} className="px-2 font-semibold text-muted">
        No
      </button>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
    </form>
  )
}

export interface TopicFormValues {
  id?: string
  titulo: string
  cita: string
  introduccion: string
  preguntas: string
  fecha: string
  hora: string
  lugar: string
  llamada: string
  materiales_url: string
  publicado: boolean
}

export function TopicForm({ initial }: { initial: TopicFormValues }) {
  const [state, action] = useActionState(saveTopic, initialFormState)
  const editing = Boolean(initial.id)
  return (
    <form action={action} className="flex flex-col gap-5">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Field label="Título" htmlFor="t-titulo" hint="Corto y con gancho. Ej.: PODER: ¿QUIÉN MANDA REALMENTE?">
        <input id="t-titulo" name="titulo" required maxLength={140} defaultValue={initial.titulo} className={`${inputStyles} font-display font-bold`} />
      </Field>
      <Field label="Cita o frase gancho" htmlFor="t-cita" hint="Sin comillas, ya las ponemos nosotros.">
        <input id="t-cita" name="cita" maxLength={300} defaultValue={initial.cita} className={inputStyles} placeholder="Vivimos en democracia." />
      </Field>
      <Field label="Introducción" htmlFor="t-intro" hint="Deja una línea en blanco entre párrafos.">
        <textarea id="t-intro" name="introduccion" rows={6} maxLength={5000} defaultValue={initial.introduccion} className={inputStyles} />
      </Field>
      <Field label="Preguntas" htmlFor="t-preguntas" hint="Una pregunta por línea. Cada una saldrá como una tarjeta.">
        <textarea id="t-preguntas" name="preguntas" rows={8} maxLength={5000} defaultValue={initial.preguntas} className={inputStyles} placeholder={'¿Vivimos en una democracia o en una tecnocracia?\n¿Quién decide qué problemas son importantes?'} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" htmlFor="t-fecha">
          <input id="t-fecha" name="fecha" type="date" required defaultValue={initial.fecha} className={inputStyles} />
        </Field>
        <Field label="Hora" htmlFor="t-hora">
          <input id="t-hora" name="hora" type="time" required defaultValue={initial.hora} className={inputStyles} />
        </Field>
      </div>
      <Field label="Lugar" htmlFor="t-lugar">
        <input id="t-lugar" name="lugar" required maxLength={120} defaultValue={initial.lugar} className={inputStyles} />
      </Field>
      <Field label="Frase para confirmar" htmlFor="t-llamada" hint="Va encima de los botones Voy / No puedo.">
        <input id="t-llamada" name="llamada" maxLength={120} defaultValue={initial.llamada} className={inputStyles} placeholder="¿Contamos contigo?" />
      </Field>
      <Field label="Enlace al podcast (opcional)" htmlFor="t-materiales" hint="Si lo dejas vacío, se usa el enlace general de CONFIG (drive_url).">
        <input id="t-materiales" name="materiales_url" type="url" defaultValue={initial.materiales_url} className={inputStyles} placeholder="https://drive.google.com/…" />
      </Field>
      <label className="flex items-center gap-3 rounded-2xl bg-mist p-4 font-semibold">
        <input type="checkbox" name="publicado" defaultChecked={initial.publicado} className="size-5 accent-mandarin" />
        Publicar ya (si no, se guarda como borrador que solo veis los admins)
      </label>
      {state.error ? <Notice kind="error">{state.error}</Notice> : null}
      <SubmitButton pendingText="Guardando…">{editing ? 'Guardar cambios' : 'Publicar sesión'}</SubmitButton>
      <a href={initial.id ? `/sesiones/${encodeURIComponent(initial.id)}` : '/admin'} className={buttonStyles.ghost}>
        Cancelar
      </a>
    </form>
  )
}
