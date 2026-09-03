function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-black/[.07] ${className}`} />
}

export default function DisciplinasLoading() {
  return (
    <main
      className="theme-page min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-10 text-[#111111] sm:px-8 sm:pt-12 lg:px-16 lg:pt-14"
      aria-label="Carregando matérias"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1120px] animate-pulse motion-reduce:animate-none">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-full" />
          </div>
          <Skeleton className="h-11 w-52 rounded-full" />
        </div>

        <section className="mb-8 rounded-3xl bg-black px-6 py-7 sm:px-8">
          <div className="flex min-h-24 flex-wrap items-center justify-between gap-8">
            {["w-48", "w-44", "w-48"].map((width, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-16 shrink-0 rounded-2xl bg-white/10" />
                <div className={`space-y-2 ${width}`}>
                  <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
                  <Skeleton className="h-7 w-32 rounded-lg bg-white/15" />
                  <Skeleton className="h-2 w-28 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-full bg-black/15" />
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <section key={index} className="min-h-56 rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <Skeleton className="size-14 rounded-2xl" />
                {index % 3 === 0 && <Skeleton className="size-5 rounded-full" />}
              </div>
              <Skeleton className="mt-5 h-5 w-3/4 rounded-full" />
              <Skeleton className="mt-2 h-3 w-2/5 rounded-full" />
              <div className="mt-6 flex items-center gap-3">
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-9 rounded-full" />
              </div>
              <div className="mt-6 flex justify-between">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </section>
          ))}
        </div>
      </div>

      <span className="sr-only">Carregando...</span>
    </main>
  )
}
