'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'
import { cn } from './ui'

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/jueves', label: 'Jueves', icon: 'cards' },
  { href: '/materiales', label: 'Materiales', icon: 'folder' },
  { href: '/perfil', label: 'Perfil', icon: 'user' },
]

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const items = isAdmin ? [...ITEMS, { href: '/admin', label: 'Admin', icon: 'shield' as const }] : ITEMS
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold',
                  active ? 'text-cobalt' : 'text-muted',
                )}
              >
                <Icon name={item.icon} className={cn('size-6', active && 'stroke-[2.4]')} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
