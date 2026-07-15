export function AIInsightsSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* Executive summary */}
      <div className="h-44 animate-pulse rounded-3xl bg-slate-200/70" />
      {/* Insight cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      {/* Panels */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/70" />
      </div>
    </div>
  )
}

export default AIInsightsSkeleton
