import Link from 'next/link'
import { Avatar } from './Avatar'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function TopBar({ usuario, nombre, isAdmin }: { usuario: string; nombre: string; isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
        <Link href="/" aria-label="Inicio" className="text-cobalt">
          <Logo className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin" aria-label="Admin" className="grid size-9 place-items-center rounded-full text-cobalt-700 hover:bg-cobalt-50">
              <Icon name="shield" />
            </Link>
          ) : null}
          <Link href="/perfil" aria-label="Mi perfil">
            <Avatar usuario={usuario} nombre={nombre} />
          </Link>
        </div>
      </div>
    </header>
  )
}
