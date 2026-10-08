import { BottomNav } from '@/components/BottomNav'
import { TopBar } from '@/components/TopBar'
import { requireUser } from '@/lib/auth/session'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return (
    <>
      <TopBar usuario={user.usuario} nombre={user.nombre} />
      <main className="mx-auto max-w-xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav isAdmin={user.rol === 'admin'} />
    </>
  )
}
