import { z } from 'zod'
import { normalizeDate } from './dates'

/* Validación de formularios. Mensajes pensados para leerse en pantalla. */

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._]{3,20}$/, 'El usuario debe tener entre 3 y 20 caracteres: letras sin tildes, números, punto o guion bajo.')

export const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(200)

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre.').max(40, 'El nombre es demasiado largo.'),
  usuario: usernameSchema,
  password: passwordSchema,
})

export const reflectionSchema = z.object({
  texto: z.string().trim().min(3, 'Escribe tu aportación.').max(2000, 'Es demasiado larga (máx. 2000 caracteres).'),
  url: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^https?:\/\//i.test(v) && URL.canParse(v)), 'El enlace debe empezar por https://'),
})

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^https?:\/\//i.test(v) && URL.canParse(v)), 'El enlace al podcast debe empezar por https://')

export const topicSchema = z.object({
  titulo: z.string().trim().min(3, 'Falta el título.').max(140),
  cita: z.string().trim().max(300),
  introduccion: z.string().trim().max(5000),
  preguntas: z
    .string()
    .trim()
    .max(5000)
    .transform((v) =>
      v
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean)
        .join('\n'),
    ),
  fecha: z.string().transform((v, ctx) => {
    const d = normalizeDate(v)
    if (!d) {
      ctx.addIssue({ code: 'custom', message: 'La fecha no es válida.' })
      return z.NEVER
    }
    return d
  }),
  hora: z
    .string()
    .trim()
    .regex(/^\d{1,2}:\d{2}$/, 'La hora debe ser tipo 21:00.'),
  lugar: z.string().trim().min(2, 'Falta el lugar.').max(120),
  llamada: z.string().trim().max(120),
  materiales_url: optionalUrl,
  publicado: z.boolean(),
})

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisa los datos del formulario.'
}
