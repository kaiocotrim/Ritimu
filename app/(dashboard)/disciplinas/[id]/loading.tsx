function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-black/[.07] ${className}`} />
}

export default function DisciplinaLoading() {
  return (
    <main
      className="theme-page min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16"
      aria-label="Carregando disciplina"
      aria-busy="true"
    >
      <div className="mx-auto max-w-5xl animate-pulse motion-reduce:animate-none">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>

        <header className="mb-8 rounded-3xl bg-black px-6 py-7 sm:px-8">
          <div className="flex min-h-24 flex-wrap items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
              <Skeleton className="h-9 w-[420px] max-w-full rounded-xl bg-white/15" />
              <Skeleton className="h-4 w-80 max-w-full rounded-full bg-white/10" />
            </div>

            <div className="min-w-40 space-y-3">
              <div className="flex justify-between gap-6">
                <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-10 rounded-full bg-white/15" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-white/10" />
              <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
            </div>
          </div>
        </header>

        <Skeleton className="mb-4 h-6 w-28 rounded-lg" />

        <div className="space-y-5">
          {Array.from({ length: 4 }, (_, sectionIndex) => (
            <section key={sectionIndex} className="overflow-hidden rounded-3xl border border-black/5 bg-white">
              <div className="border-b border-black/5 bg-black/[.02] px-5 py-4 sm:px-6">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="mt-2 h-3 w-10 rounded-full" />
              </div>

              <div className="flex items-start gap-4 px-5 py-4 sm:px-6">
                <Skeleton className="mt-2 size-5 shrink-0 rounded" />
                <Skeleton className="mt-0.5 size-9 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-4/5 rounded-full" />
                </div>
                <Skeleton className="mt-2 hidden h-4 w-24 shrink-0 rounded-full sm:block" />
              </div>
            </section>
          ))}
        </div>
      </div>

      <span className="sr-only">Carregando...</span>
    </main>
  )
}
