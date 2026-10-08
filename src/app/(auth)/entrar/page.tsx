import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/session'
import { isDemoMode } from '@/lib/config'
import { LoginForm } from '../AuthForms'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect('/')
  const { next } = await searchParams
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return <LoginForm next={safe} demo={isDemoMode()} />
}
