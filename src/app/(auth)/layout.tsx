import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <div className="azulejo h-16 border-b border-line pt-[env(safe-area-inset-top)]" aria-hidden="true" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-8">
        <Logo className="mb-5 h-24 w-auto self-start text-cacao" />
        <p className="mb-7 max-w-xs font-display text-2xl leading-snug text-cacao">
          Filosofía, actualidad y unas tapas. <em className="text-terra">Cada jueves.</em>
        </p>
        <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_20px_50px_-30px_rgba(126,85,57,0.5)]">{children}</div>
      </div>
    </div>
  )
}
