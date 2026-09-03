function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-black/[.07] ${className}`} />
}

export default function DashboardLoading() {
  return (
    <main
      className="flex min-h-screen items-center bg-[#F6F5F1] px-6 pb-32 pt-8 text-[#111111] sm:px-10 lg:px-16"
      aria-label="Carregando dashboard"
      aria-busy="true"
    >
      <div className="mx-auto w-full max-w-6xl animate-pulse motion-reduce:animate-none">
        <div className="mb-5 flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="h-[328px] overflow-hidden rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
            <Skeleton className="h-5 w-40 rounded-full" />
            <div className="mt-7 flex items-center">
              <Skeleton className="size-52 rounded-full" />
            </div>
          </section>

          <section className="h-[328px] rounded-3xl border border-black/5 bg-[#191c2a] p-6 sm:p-7">
            <Skeleton className="h-5 w-36 rounded-full bg-white/15" />
            <div className="mt-7 flex items-center gap-4">
              <Skeleton className="size-16 shrink-0 rounded-2xl bg-white/15" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-2/3 rounded-full bg-white/15" />
                <Skeleton className="h-4 w-1/2 rounded-full bg-white/10" />
              </div>
            </div>
            <Skeleton className="mt-7 h-2 w-full rounded-full bg-white/10" />
            <Skeleton className="mt-9 h-14 w-full rounded-2xl bg-white/15" />
          </section>

          <section className="h-[248px] rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="mt-10 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="size-12 rounded-full" />
                </div>
              ))}
            </div>
          </section>

          <section className="h-[248px] rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <div className="mt-6 w-[72%] space-y-5">
              {[0, 1].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <Skeleton className="size-12 shrink-0 rounded-xl" />
                  <Skeleton className="h-4 w-12 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <span className="sr-only">Carregando...</span>
    </main>
  )
}
