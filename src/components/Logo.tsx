import { JARRA_PATH, JARRA_VIEWBOX } from './jarra-path'
import { LOGO_PATH, LOGO_VIEWBOX } from './logo-path'

/** Logo en negativo: toma el color del texto (cobalto, blanco…). */
export function Logo({ className, title = 'Filo y Tapas' }: { className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label={title}>
      <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  )
}

export function Jarra({ className }: { className?: string }) {
  return (
    <svg viewBox={JARRA_VIEWBOX} className={className} aria-hidden="true">
      <path fill="currentColor" fillRule="evenodd" d={JARRA_PATH} />
    </svg>
  )
}
