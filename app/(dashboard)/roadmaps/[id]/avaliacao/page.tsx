import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FULL_STACK_NODES, readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"
import { getAssessmentOutcome, isAssessmentUnlocked } from "@/lib/roadmaps/full-stack/assessment-rules"
import { FullStackAssessment } from "@/components/roadmaps/full-stack/full-stack-assessment"

export default async function RoadmapAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const { id } = await params
  const roadmap = await prisma.studyRoadmap.findFirst({
    where: { id, slug: "full-stack-developer", OR: [{ isPublic: true }, { creatorId: session.user.id }] },
    select: {
      id: true,
      title: true,
      assessmentAttempts: { where: { userId: session.user.id }, orderBy: [{ correctAnswers: "desc" }, { submittedAt: "desc" }], take: 1 },
      modules: { select: { lessons: { select: { sourceMetadata: true, progress: { where: { userId: session.user.id, status: "COMPLETED" }, select: { id: true } } } } } },
    },
  })
  if (!roadmap) notFound()

  const completed = roadmap.modules.flatMap((module) => module.lessons).filter((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata) && lesson.progress.length > 0).length
  const unlocked = isAssessmentUnlocked(completed, FULL_STACK_NODES.length)
  if (!unlocked) redirect(`/roadmaps/${roadmap.id}`)

  const attempt = roadmap.assessmentAttempts[0]
  const initialResult = attempt ? getAssessmentOutcome(attempt.correctAnswers) : null

  return <main className="min-h-screen bg-[#faf9f0] px-4 pb-24 pt-6 text-[#111820] sm:px-8 xl:pl-80">
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#172017] pb-5">
        <Link href={`/roadmaps/${roadmap.id}`} className="font-pixel inline-flex items-center gap-2 text-xs font-bold uppercase text-black/60 transition hover:text-black"><ArrowLeft className="size-4" /> Voltar para a trilha</Link>
        <span className="font-pixel inline-flex items-center gap-2 border border-green-700 bg-green-50 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-green-700"><ShieldCheck className="size-4" /> Ambiente de avaliação</span>
      </header>
      <div className="mb-6"><p className="font-pixel text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">Avaliação final</p><h1 className="font-pixel mt-2 text-3xl font-bold sm:text-4xl">{roadmap.title}</h1><p className="mt-2 text-sm text-black/55">Responda às 50 questões. Você precisa de pelo menos 45 acertos para concluir e emitir o certificado.</p></div>
      <FullStackAssessment roadmapId={roadmap.id} unlocked initialResult={initialResult} userName={session.user.name} />
    </div>
  </main>
}
