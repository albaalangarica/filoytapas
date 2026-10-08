/** Estado que devuelven las acciones de formulario (para useActionState). */
export interface FormState {
  error?: string
  ok?: string
  /** Contraseña provisional generada al resetear: se enseña una sola vez. */
  secret?: string
}

export const initialFormState: FormState = {}
