function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-[#dde1dc] motion-reduce:animate-none ${className}`} />
}

export default function RoadmapDetailLoading() {
  return <main className="roadmaps-pixel-ui min-h-screen bg-[#faf9f0] px-4 pb-32 pt-6 sm:px-7 lg:px-10" aria-label="Carregando roadmap" aria-busy="true">
    <div className="mx-auto max-w-330">
      <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4"><Skeleton className="h-9 w-44" /><Skeleton className="size-10" /></div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Skeleton className="h-64 w-full" />
          <section className="border-2 border-[#172017]/15 bg-white p-5"><div className="flex items-center justify-between gap-4"><Skeleton className="h-5 w-52" /><Skeleton className="h-8 w-16" /></div><Skeleton className="mt-4 h-3 w-full" /></section>
          <section className="border border-black/10 bg-white p-3"><div className="flex flex-col gap-3 lg:flex-row"><Skeleton className="h-11 flex-1" /><Skeleton className="h-11 w-full lg:w-96" /><Skeleton className="h-11 w-full lg:w-44" /></div></section>
          <Skeleton className="h-[620px] w-full" />
        </div>
        <aside className="hidden space-y-5 xl:block"><Skeleton className="h-48 w-full" /><Skeleton className="h-36 w-full" /><Skeleton className="h-56 w-full" /></aside>
      </div>
    </div>
    <span className="sr-only">Carregando...</span>
  </main>
}
