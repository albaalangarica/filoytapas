export default function Loading() {
  return (
    <div className="flex flex-col gap-4 pt-6" aria-busy="true" aria-label="Cargando">
      <div className="h-56 animate-pulse rounded-card bg-oliva-50" />
      <div className="h-20 animate-pulse rounded-card bg-mist" />
      <div className="h-20 animate-pulse rounded-card bg-mist" />
    </div>
  )
}
