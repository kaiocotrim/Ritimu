import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BookOpen, Clock3, Map as MapIcon, Sparkles } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureOfficialRoadmaps } from "@/lib/roadmaps/service"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SelectRoadmapButton } from "@/components/roadmaps/select-roadmap-button"
import { CharacterSelection } from "@/components/roadmaps/character-selection"

export default async function RoadmapsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  await ensureOfficialRoadmaps()
  const roadmaps = await prisma.studyRoadmap.findMany({
    where: { OR: [{ isPublic: true }, { creatorId: session.user.id }] },
    orderBy: [{ isOfficial: "desc" }, { title: "asc" }],
    select: {
      id: true, title: true, description: true, category: true, difficulty: true, estimatedHours: true, isOfficial: true,
      modules: { select: { _count: { select: { lessons: true } } } },
      enrollments: { where: { userId: session.user.id }, select: { id: true } },
    },
  })
  const completedByRoadmap = await prisma.roadmapLessonProgress.groupBy({
    by: ["lessonId"], where: { userId: session.user.id, status: "COMPLETED" }, _count: true,
  })
  const completedIds = new Set(completedByRoadmap.map((item) => item.lessonId))
  const lessonRoadmaps = await prisma.roadmapLesson.findMany({ where: { id: { in: [...completedIds] } }, select: { id: true, module: { select: { roadmapId: true } } } })
  const counts = new Map<string, number>()
  lessonRoadmaps.forEach((item) => counts.set(item.module.roadmapId, (counts.get(item.module.roadmapId) ?? 0) + 1))
  const selectedRoadmaps = roadmaps.filter((roadmap) => roadmap.enrollments.length > 0)
  const categories = [...new Set(roadmaps.map((roadmap) => roadmap.category))]

  const renderCard = (roadmap: (typeof roadmaps)[number]) => {
    const total = roadmap.modules.reduce((sum, module) => sum + module._count.lessons, 0)
    const done = counts.get(roadmap.id) ?? 0
    const percent = total ? Math.round(done / total * 100) : 0
    const selected = roadmap.enrollments.length > 0
    return <article key={roadmap.id} className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
      <div className="flex items-start justify-between gap-4"><div className="grid size-12 place-items-center rounded-lg border-2 border-[#101217] bg-[#101217] text-white"><BookOpen className="size-5" /></div>{selected ? <span className="font-pixel rounded-lg border border-[#299d37] bg-[#e4f8e6] px-3 py-1 text-[10px] font-bold uppercase text-[#299d37]">Minha Trilha</span> : roadmap.isOfficial && <span className="font-pixel rounded-lg border border-amber-700 bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">Oficial</span>}</div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-black/35">{roadmap.category} · {roadmap.difficulty === "BEGINNER" ? "Iniciante" : roadmap.difficulty}</p><h3 className="mt-2 text-2xl font-bold">{roadmap.title}</h3><p className="mt-2 line-clamp-2 leading-6 text-black/55">{roadmap.description}</p>
      <div className="mt-6 flex items-center justify-between text-sm"><span>{done}/{total} etapas</span><span className="flex items-center gap-1.5 text-black/45"><Clock3 className="size-4" /> {roadmap.estimatedHours}h</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full bg-[#50D05C]" style={{ width: `${percent}%` }} /></div>
      <SelectRoadmapButton roadmapId={roadmap.id} selected={selected} />
    </article>
  }

  return <main className="min-h-screen bg-[#F6F5F1] px-5 pb-32 pt-10 text-[#111] sm:px-10 lg:px-16 xl:pl-[calc(18rem+2.5rem)]">
    <CharacterSelection />
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><div className="font-pixel mb-3 inline-flex items-center gap-2 rounded-lg border border-[#299d37] bg-[#e4f8e6] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#299d37]"><MapIcon className="size-4" /> Trilhas Ritimu</div><h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Roadmaps de estudos</h1><p className="mt-3 max-w-2xl text-base leading-7 text-black/55">Avance etapa por etapa, ganhe XP e transforme um objetivo grande em uma jornada possível.</p></div>
        <span aria-disabled="true" title="Em breve" className="font-pixel inline-flex items-center gap-2 self-start rounded-full border-2 border-violet-300 bg-violet-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-violet-700 opacity-75"><Sparkles className="size-4" /> Criar com IA</span>
      </header>
      {selectedRoadmaps.length > 0 && <section className="mt-10"><h2 className="text-xl font-bold">Minhas trilhas</h2><p className="mt-1 text-sm text-black/50">Continue de onde parou.</p><div className="mt-5 grid gap-5 md:grid-cols-2">{selectedRoadmaps.map(renderCard)}</div></section>}
      <section className="mt-12"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-bold">Explore todos os roadmaps</h2><p className="mt-1 text-sm text-black/50">Escolha uma área e adicione a trilha ao seu perfil.</p></div><span className="text-sm font-semibold text-black/40">{roadmaps.length} trilhas disponíveis</span></div>
        <div className="mt-5 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/60">{category}</span>)}</div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{roadmaps.map(renderCard)}</div>
      </section>
    </div><Sidebar />
  </main>
}
