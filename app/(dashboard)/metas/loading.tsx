function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-black/[.07] ${className}`} />
}

export default function MetasLoading() {
  return (
    <main
      className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16"
      aria-label="Carregando missões"
      aria-busy="true"
    >
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <header className="mb-6 space-y-3">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-full" />
        </header>

        <section className="mb-8 rounded-3xl bg-black px-6 py-7 sm:px-8">
          <div className="flex min-h-24 flex-wrap items-center justify-between gap-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="size-14 shrink-0 rounded-2xl bg-white/10" />
                <div className="w-40 space-y-2">
                  <Skeleton className="h-3 w-28 rounded-full bg-white/10" />
                  <Skeleton className="h-7 w-32 rounded-lg bg-white/15" />
                  {item !== 0 && <Skeleton className="h-2 w-28 rounded-full bg-white/10" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-5 flex gap-2">
          <Skeleton className="h-9 w-20 rounded-full bg-black/15" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 6 }, (_, index) => (
            <section
              key={index}
              className="flex min-h-24 flex-col gap-4 rounded-3xl border border-black/5 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex min-w-0 items-start gap-4">
                <Skeleton className="size-11 shrink-0 rounded-2xl" />
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-44 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-80 max-w-full rounded-full" />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-5 sm:pl-4">
                <div className="hidden items-center gap-3 sm:flex">
                  <Skeleton className="h-2 w-32 rounded-full" />
                  <Skeleton className="h-3 w-7 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
              </div>
            </section>
          ))}
        </div>
      </div>

      <span className="sr-only">Carregando...</span>
    </main>
  )
}
