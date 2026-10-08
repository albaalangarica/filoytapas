import Link from 'next/link'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function TopBar({ usuario, nombre, isAdmin }: { usuario: string; nombre: string; isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-20 bg-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
        <Link href="/" aria-label="Inicio" className="text-cacao">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin" aria-label="Admin" className="grid size-9 place-items-center rounded-full text-oliva-700 hover:bg-oliva-50">
              <Icon name="shield" />
            </Link>
          ) : null}
          <Link href="/perfil" aria-label="Mi perfil">
            <Avatar usuario={usuario} nombre={nombre} />
          </Link>
        </div>
      </div>
      <div className="azulejo h-5 border-y border-line bg-[length:20px_20px]" aria-hidden="true" />
    </header>
  )
}
