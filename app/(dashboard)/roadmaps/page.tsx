import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BookOpen, Clock3 } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureOfficialRoadmaps } from "@/lib/roadmaps/service"
import { readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"
import { RoadmapTopBar } from "@/components/roadmaps/roadmap-top-bar"
import { SelectRoadmapButton } from "@/components/roadmaps/select-roadmap-button"
import { CharacterSelection } from "@/components/roadmaps/character-selection"
import { RoadmapsMotionCard, RoadmapsMotionItem, RoadmapsMotionPage, RoadmapsMotionSection } from "@/components/roadmaps/roadmaps-motion"

export default async function RoadmapsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  await ensureOfficialRoadmaps()
  const roadmaps = await prisma.studyRoadmap.findMany({
    where: { slug: "full-stack-developer", OR: [{ isPublic: true }, { creatorId: session.user.id }] },
    orderBy: [{ isOfficial: "desc" }, { title: "asc" }],
    select: {
      id: true, slug: true, title: true, description: true, category: true, difficulty: true, estimatedHours: true, isOfficial: true,
      modules: { select: { lessons: { select: { id: true, sourceMetadata: true } } } },
      enrollments: { where: { userId: session.user.id }, select: { id: true } },
    },
  })
  const completedByRoadmap = await prisma.roadmapLessonProgress.groupBy({
    by: ["lessonId"], where: { userId: session.user.id, status: "COMPLETED" }, _count: true,
  })
  const completedIds = new Set(completedByRoadmap.map((item) => item.lessonId))
  const selectedRoadmaps = roadmaps.filter((roadmap) => roadmap.enrollments.length > 0)
  const categories = [...new Set(roadmaps.map((roadmap) => roadmap.category))]

  const renderCard = (roadmap: (typeof roadmaps)[number], index: number) => {
    const lessons = roadmap.modules.flatMap((module) => module.lessons).filter((lesson) => roadmap.slug !== "full-stack-developer" || readFullStackNodeMetadata(lesson.sourceMetadata))
    const total = lessons.length
    const done = lessons.filter((lesson) => completedIds.has(lesson.id)).length
    const percent = total ? Math.round(done / total * 100) : 0
    const selected = roadmap.enrollments.length > 0
    return <RoadmapsMotionCard key={roadmap.id} delay={0.16 + index * 0.07}><article className="relative h-full overflow-hidden border-2 border-[#172017] bg-white p-6 shadow-[5px_5px_0_#c18b2f] transition hover:shadow-[7px_7px_0_#45b950] sm:p-7">
      <div className="flex items-start justify-between gap-4"><div className="grid size-12 place-items-center rounded-lg border-2 border-[#101217] bg-[#101217] text-white"><BookOpen className="size-5" /></div>{selected ? <span className="font-pixel rounded-lg border border-[#299d37] bg-[#e4f8e6] px-3 py-1 text-[10px] font-bold uppercase text-[#299d37]">Minha Trilha</span> : roadmap.isOfficial && <span className="font-pixel rounded-lg border border-amber-700 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">Oficial</span>}</div>
      <p className="font-pixel mt-6 text-xs font-bold uppercase tracking-[.16em] text-black/35">{roadmap.category} · {roadmap.difficulty === "BEGINNER" ? "Iniciante" : roadmap.difficulty}</p><h3 className="font-pixel mt-2 text-2xl font-bold">{roadmap.title}</h3><p className="mt-2 line-clamp-2 leading-6 text-black/55">{roadmap.description}</p>
      <div className="mt-6 flex items-center justify-between text-sm"><span>{done}/{total} etapas</span><span className="flex items-center gap-1.5 text-black/45"><Clock3 className="size-4" /> {roadmap.estimatedHours}h</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#50D05C]" style={{ width: `${percent}%` }} /></div>
      <SelectRoadmapButton roadmapId={roadmap.id} selected={selected} />
    </article></RoadmapsMotionCard>
  }

  return <RoadmapsMotionPage className="roadmaps-pixel-ui min-h-screen bg-[#F6F5F1] px-5 pb-32 pt-6 text-[#111] sm:px-10 lg:px-16">
    <CharacterSelection />
    <div className="mx-auto max-w-6xl">
      <RoadmapsMotionItem delay={0.03}><RoadmapTopBar className="mb-8" /></RoadmapsMotionItem>
      <RoadmapsMotionItem delay={0.08} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><h1 className="font-pixel text-4xl font-bold tracking-tight sm:text-5xl">Roadmaps de estudos</h1><p className="mt-3 max-w-2xl text-base leading-7 text-black/55">Avance etapa por etapa, ganhe XP e transforme um objetivo grande em uma jornada possível.</p></div>
        <span aria-disabled="true" title="Em breve" className="font-pixel inline-flex items-center gap-2 self-start rounded-full border-2 border-violet-300 bg-violet-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-violet-700 opacity-75">IA</span>
      </RoadmapsMotionItem>
      {selectedRoadmaps.length > 0 && <RoadmapsMotionSection delay={0.12} className="mt-10"><h2 className="font-pixel text-xl font-bold">Minhas trilhas</h2><p className="mt-1 text-sm text-black/50">Continue de onde parou.</p><div className="mt-5 grid gap-5 md:grid-cols-2">{selectedRoadmaps.map(renderCard)}</div></RoadmapsMotionSection>}
      <RoadmapsMotionSection delay={0.2} className="mt-12"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-pixel text-2xl font-bold">Explore todos os roadmaps</h2><p className="mt-1 text-sm text-black/50">Escolha uma área e adicione a trilha ao seu perfil.</p></div><span className="font-pixel text-sm font-semibold text-black/40">{roadmaps.length} trilhas disponíveis</span></div>
        <RoadmapsMotionItem delay={0.26} className="mt-5 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60">{category}</span>)}</RoadmapsMotionItem>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{roadmaps.map(renderCard)}</div>
      </RoadmapsMotionSection>
    </div>
  </RoadmapsMotionPage>
}
