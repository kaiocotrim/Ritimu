function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-white/[.08] ${className}`} />
}

export function StudyPlannerSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="h-[430px] animate-pulse rounded-[28px] bg-[#12151D] p-4 ring-1 ring-white/[.08] motion-reduce:animate-none">
        <div className="grid h-full min-w-[760px] grid-cols-7 divide-x divide-white/[.06] overflow-hidden rounded-2xl">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="px-3 py-4">
              <Skeleton className="mx-auto h-3 w-8 rounded-full" />
              <Skeleton className="mx-auto mt-3 size-9 rounded-full" />
              {index % 3 !== 2 && <Skeleton className="mt-6 h-16 w-full rounded-xl" />}
              {index % 2 === 0 && <Skeleton className="mt-2 h-16 w-full rounded-xl" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl animate-pulse motion-reduce:animate-none">
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-44 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full bg-[#50D05C]/20" />
        </div>
      </header>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_260px]">
        <section className="rounded-[28px] bg-[#12151D] p-6 ring-1 ring-white/[.08]">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-64 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-2 w-full rounded-full" />
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
          </div>
        </section>
        <Skeleton className="min-h-36 rounded-[28px] bg-white/[.06] ring-1 ring-white/[.08]" />
      </div>

      <StudyPlannerSkeleton compact />
    </div>
  )
}
