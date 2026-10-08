import { Logo } from '@/components/Logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cobalt text-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
        <Logo className="mb-6 h-24 w-auto self-start text-white" />
        <p className="mb-8 max-w-xs font-display text-2xl font-bold leading-tight">
          Filosofía, actualidad y unas tapas. <span className="text-mandarin">Cada jueves.</span>
        </p>
        <div className="rounded-[1.75rem] bg-paper p-6 text-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)]">{children}</div>
      </div>
    </div>
  )
}
