export function Questions({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null
  return (
    <ol className="flex flex-col gap-2.5">
      {questions.map((q, i) => (
        <li key={i} className="flex gap-3 rounded-r-2xl border-l-4 border-mandarin bg-mist px-4 py-3">
          <span className="font-display text-sm font-extrabold text-mandarin-700 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span className="font-semibold leading-snug">{q}</span>
        </li>
      ))}
    </ol>
  )
}
