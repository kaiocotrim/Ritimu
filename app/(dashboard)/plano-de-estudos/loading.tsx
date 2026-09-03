import { StudyPlannerSkeleton } from "@/components/study-plan/study-planner-skeleton"

export default function StudyPlanLoading() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#08090D] px-4 pb-32 pt-7 text-white sm:px-8 lg:px-12"
      aria-label="Carregando plano de estudos"
      aria-busy="true"
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#222631_0%,#0d0f15_42%,#08090d_78%)]" />
        <div className="absolute inset-0 bg-[url('/Estrelas.png')] bg-cover bg-center bg-no-repeat opacity-55" />
      </div>
      <div className="relative z-10">
        <StudyPlannerSkeleton />
      </div>
      <span className="sr-only">Carregando...</span>
    </main>
  )
}
