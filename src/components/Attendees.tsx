import type { Person } from '@/lib/view'
import { Avatar } from './Avatar'

export function Attendees({ going, notGoing }: { going: Person[]; notGoing: Person[] }) {
  return (
    <div className="flex flex-col gap-6">
      <PeopleGroup title={`Van · ${going.length}`} emoji="🔥" people={going} empty="Nadie ha confirmado todavía. ¡Sé la primera persona!" />
      <PeopleGroup title={`No pueden · ${notGoing.length}`} emoji="💔" people={notGoing} empty="De momento, nadie." />
    </div>
  )
}

function PeopleGroup({ title, emoji, people, empty }: { title: string; emoji: string; people: Person[]; empty: string }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
        {emoji} {title}
      </h3>
      {people.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {people.map((p) => (
            <li key={p.usuario} className="flex items-center gap-2 rounded-full bg-mist py-1 pl-1 pr-3 text-sm font-semibold">
              <Avatar usuario={p.usuario} nombre={p.nombre} size="sm" />
              {p.nombre}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
