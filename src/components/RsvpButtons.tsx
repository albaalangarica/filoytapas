import { setAttendance } from '@/lib/actions/member'
import type { Answer } from '@/lib/domain/model'
import { SubmitButton } from './SubmitButton'
import { cn } from './ui'

/** Voy 🔥 / No puedo 💔. Funciona aunque el JavaScript aún no haya cargado. */
export function RsvpButtons({ temaId, myAnswer }: { temaId: string; myAnswer: Answer | null }) {
  const base = 'w-full rounded-full px-3 py-3.5 text-base font-bold transition active:scale-[0.98] disabled:opacity-80'
  return (
    <form action={setAttendance} className="grid grid-cols-2 gap-3">
      <input type="hidden" name="temaId" value={temaId} />
      <SubmitButton
        name="respuesta"
        value="voy"
        pendingText="…"
        variant="bare"
        className={cn(
          base,
          myAnswer === 'voy'
            ? 'animate-pop bg-mandarin text-white ring-4 ring-mandarin/25'
            : myAnswer === 'no'
              ? 'border border-mandarin/40 bg-white text-mandarin-700'
              : 'bg-mandarin text-white shadow-[0_4px_0_0_var(--color-mandarin-700)]',
        )}
      >
        {myAnswer === 'voy' ? '¡Voy! 🔥' : 'Voy 🔥'}
      </SubmitButton>
      <SubmitButton
        name="respuesta"
        value="no"
        pendingText="…"
        variant="bare"
        className={cn(
          base,
          myAnswer === 'no' ? 'bg-cobalt text-white ring-4 ring-cobalt/25' : 'border border-cobalt/30 bg-cobalt-50 text-cobalt-700',
        )}
      >
        No puedo 💔
      </SubmitButton>
    </form>
  )
}
