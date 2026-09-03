function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-black/[.07] ${className}`} />
}

export default function RankingLoading() {
  return (
    <main
      className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16"
      aria-label="Carregando ranking"
      aria-busy="true"
    >
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <header className="mb-6 space-y-3">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" />
        </header>

        <section className="relative mb-6 overflow-hidden rounded-3xl bg-black p-6 sm:p-8">
          <div className="absolute -right-12 -top-20 size-64 rounded-full bg-[#50D05C]/10 blur-3xl" />
          <div className="relative flex min-h-28 flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="space-y-3">
              <Skeleton className="h-7 w-36 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-64 rounded-lg bg-white/15" />
              <Skeleton className="h-4 w-80 max-w-full rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-2xl bg-[#50D05C]/20" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-7 w-24 rounded-lg bg-white/15" />
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[2, 1, 3].map((position) => (
            <section key={position} className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-black/5 bg-white p-5">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="mt-4 h-5 w-28 rounded-full" />
              <Skeleton className="mt-2 h-4 w-20 rounded-full" />
              <Skeleton className="mt-4 h-7 w-16 rounded-full" />
            </section>
          ))}
        </div>

        <section className="overflow-hidden rounded-3xl border border-black/5 bg-white">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 sm:px-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded-full" />
              <Skeleton className="h-3 w-72 max-w-full rounded-full" />
            </div>
            <Skeleton className="size-6 rounded-lg" />
          </div>

          <div className="divide-y divide-black/5">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                <Skeleton className="h-5 w-8 shrink-0 rounded" />
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-3 w-52 max-w-full rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <span className="sr-only">Carregando...</span>
    </main>
  )
}
