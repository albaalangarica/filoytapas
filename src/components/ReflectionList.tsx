import type { TopicSummary } from '@/lib/view'
import { ReflectionItem } from './ReflectionItem'

/** Lo que ha dicho cada uno sobre una sesión. Visible para todo el grupo. */
export function ReflectionList({ reflections, me, isAdmin }: { reflections: TopicSummary['reflections']; me: string; isAdmin: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {reflections.map((r) => (
        <ReflectionItem
          key={r.id}
          id={r.id}
          texto={r.texto}
          url={r.url}
          usuario={r.usuario}
          nombre={r.nombre}
          canEdit={r.usuario === me}
          canDelete={r.usuario === me || isAdmin}
        />
      ))}
    </ul>
  )
}
