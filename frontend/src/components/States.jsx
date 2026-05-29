export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-sm text-stone-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        {label}
      </div>
    </div>
  )
}

export function Empty({ label, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white/40 py-14 text-center">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}
