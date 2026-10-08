import Link from 'next/link'
import { buttonStyles } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl">🤔</p>
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="max-w-xs text-muted">Quizá el tema se ha movido o el enlace está incompleto.</p>
      <Link href="/" className={buttonStyles.primary}>
        Volver al inicio
      </Link>
    </main>
  )
}
