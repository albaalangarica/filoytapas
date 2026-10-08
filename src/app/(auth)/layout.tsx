import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(120%_60%_at_100%_0%,var(--color-cobalt-100),transparent_60%),radial-gradient(90%_50%_at_0%_100%,var(--color-mandarin-50),transparent_60%)] bg-paper">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
        <Logo className="mb-5 h-24 w-auto self-start text-cobalt" />
        <p className="mb-7 max-w-xs font-display text-2xl font-bold leading-tight text-ink">
          Filosofía, actualidad y unas tapas. <span className="text-mandarin">Cada jueves.</span>
        </p>
        <div className="rounded-[1.75rem] border border-line bg-white p-6 shadow-[0_24px_60px_-30px_rgba(30,71,224,0.45)]">{children}</div>
      </div>
    </div>
  )
}
