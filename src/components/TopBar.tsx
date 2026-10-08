import Link from 'next/link'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

export function TopBar({ usuario, nombre }: { usuario: string; nombre: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
        <Link href="/" aria-label="Inicio" className="text-cobalt">
          <Logo className="h-9 w-auto" />
        </Link>
        <Link href="/perfil" aria-label="Mi perfil">
          <Avatar usuario={usuario} nombre={nombre} />
        </Link>
      </div>
    </header>
  )
}
