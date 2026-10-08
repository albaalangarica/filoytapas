export function Questions({ questions }: { questions: string[] }) {
  if (questions.length === 0) return null
  return (
    <ol className="flex flex-col divide-y divide-dashed divide-line rounded-card border border-line bg-white px-4">
      {questions.map((q, i) => (
        <li key={i} className="flex gap-3 py-3.5">
          <span className="font-display text-lg italic leading-6 text-terra tabular-nums">{i + 1}.</span>
          <span className="font-medium leading-6">{q}</span>
        </li>
      ))}
    </ol>
  )
}
