import type { Metadata } from 'next'
import { redirect, unstable_rethrow } from 'next/navigation'
import { connection } from 'next/server'
import { Notice } from '@/components/ui'
import { getCurrentUser } from '@/lib/auth/session'
import { configProblems, isDemoMode } from '@/lib/config'
import { getAppData } from '@/lib/data'
import { explainStoreError } from '@/lib/store/errors'
import { LoginForm } from '../AuthForms'

export const metadata: Metadata = { title: 'Entrar' }

/** Comprueba la configuración y la conexión con el Sheet para avisar en pantalla si algo falla. */
async function setupProblem(): Promise<string | null> {
  // Siempre en el momento de la petición: el resultado depende de la configuración y del Sheet.
  await connection()
  const problems = configProblems()
  if (problems.length > 0) return `La app no está bien configurada en Vercel. ${problems.join(' ')}`
  try {
    await getAppData()
    return null
  } catch (error) {
    unstable_rethrow(error)
    console.error('entrar: no se pudo leer el Sheet', error)
    return explainStoreError(error)
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const problem = await setupProblem()
  if (problem) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Falta un ajuste</h1>
        <Notice kind="error">{problem}</Notice>
        <p className="text-sm text-muted">Tras corregirlo en Vercel (Settings → Environments → Production), haz Redeploy.</p>
      </div>
    )
  }
  if (await getCurrentUser()) redirect('/')
  const { next } = await searchParams
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return <LoginForm next={safe} demo={isDemoMode()} />
}
