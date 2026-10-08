export function Questions({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null
  return (
    <ol className="flex flex-col gap-2.5">
      {questions.map((q, i) => (
        <li key={i} className="flex gap-3 rounded-r-2xl border-l-4 border-mandarin bg-white px-4 py-3 shadow-[0_1px_0_var(--color-line)]">
          <span className="font-display text-sm font-extrabold leading-6 text-mandarin-700 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
          <span className="font-medium leading-6">{q}</span>
        </li>
      ))}
    </ol>
  )
}
