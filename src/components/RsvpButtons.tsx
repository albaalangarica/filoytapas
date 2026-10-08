import { setAttendance } from '@/lib/actions/member'
import type { Answer } from '@/lib/domain/model'
import { SubmitButton } from './SubmitButton'
import { cn } from './ui'

/** Voy 🔥 / No puedo 💔. Funciona aunque el JavaScript aún no haya cargado. */
export function RsvpButtons({ temaId, myAnswer, onDark = false }: { temaId: string; myAnswer: Answer | null; onDark?: boolean }) {
  const base = 'w-full rounded-2xl px-3 py-3.5 text-base font-extrabold transition active:scale-[0.98] disabled:opacity-80'
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
            ? 'bg-mandarin text-white ring-4 ring-mandarin/30 animate-pop'
            : onDark
              ? myAnswer === 'no'
                ? 'bg-white/15 text-white hover:bg-white/25'
                : 'bg-white text-mandarin-700'
              : myAnswer === 'no'
                ? 'bg-mist text-ink'
                : 'bg-mandarin text-white',
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
          myAnswer === 'no'
            ? onDark
              ? 'bg-white text-ink ring-4 ring-white/30'
              : 'bg-ink text-white ring-4 ring-ink/20'
            : onDark
              ? 'bg-white/15 text-white hover:bg-white/25'
              : 'bg-mist text-ink',
        )}
      >
        No puedo 💔
      </SubmitButton>
    </form>
  )
}
