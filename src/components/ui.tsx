import Link from 'next/link'

/* Piezas de interfaz compartidas (componentes de servidor). */

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const buttonStyles = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-terra px-6 py-3 font-bold text-white shadow-[0_4px_0_0_var(--color-terra-700)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-60',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-full border border-oliva/30 bg-oliva-50 px-6 py-3 font-bold text-oliva-700 transition hover:bg-oliva-100 disabled:opacity-60',
  ghost: 'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 font-semibold text-oliva-700 hover:bg-oliva-50',
  danger: 'inline-flex items-center justify-center gap-2 rounded-2xl bg-danger-50 px-4 py-2.5 font-bold text-danger',
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-xs font-bold uppercase tracking-[0.14em] text-terra-700', className)}>{children}</p>
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-1 pb-5 pt-7">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-[2.1rem] font-semibold leading-tight tracking-tight text-cacao">{title}</h1>
      {children ? <div className="text-muted">{children}</div> : null}
    </header>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between gap-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{children}</h2>
      {action}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-card border-2 border-dashed border-line px-5 py-8 text-center">
      <p className="font-display text-lg font-semibold text-cacao">{title}</p>
      {children ? <div className="mt-1 text-sm text-muted">{children}</div> : null}
    </div>
  )
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-terra-700 hover:underline">
      {children}
    </Link>
  )
}

export const inputStyles =
  'w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink placeholder:text-muted/70 focus:border-terra focus:outline-none focus:ring-2 focus:ring-terra-50'

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  htmlFor: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-bold">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-xl px-4 py-3 text-sm font-semibold',
        kind === 'error' ? 'bg-danger-50 text-danger' : 'bg-ok-50 text-ok',
      )}
    >
      {children}
    </p>
  )
}
