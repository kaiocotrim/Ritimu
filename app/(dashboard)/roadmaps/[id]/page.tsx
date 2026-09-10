import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Clock3, Star } from "lucide-react"
import { auth } from "@/lib/auth"
import { getGamificationSummary } from "@/lib/gamification"
import { getMissionProgress } from "@/lib/missions"
import { prisma } from "@/lib/prisma"
import { readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"
import { RoadmapJourney } from "@/components/roadmaps/roadmap-journey"
import { FullStackRoadmap } from "@/components/roadmaps/full-stack/full-stack-roadmap"
import { RoadmapStatsPanel } from "@/components/roadmaps/roadmap-stats-panel"
import { CharacterSelection } from "@/components/roadmaps/character-selection"
import { RoadmapTopBar } from "@/components/roadmaps/roadmap-top-bar"

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { id } = await params
  const [roadmap, gamification, missions, activeRoadmaps, recommendations] = await Promise.all([
    prisma.studyRoadmap.findFirst({ where: { id, OR: [{ isPublic: true }, { creatorId: session.user.id }] }, include: { assessmentAttempts: { where: { userId: session.user.id }, orderBy: [{ correctAnswers: "desc" }, { submittedAt: "desc" }], take: 1 }, modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { prerequisites: true, progress: { where: { userId: session.user.id } } } } } } } }),
    getGamificationSummary(session.user.id),
    getMissionProgress(session.user.id),
    prisma.roadmapEnrollment.count({ where: { userId: session.user.id, completedAt: null } }),
    prisma.studyRoadmap.findMany({ where: { isPublic: true, slug: "full-stack-developer", id: { not: id } }, take: 4, orderBy: { title: "asc" }, select: { id: true, title: true, category: true, estimatedHours: true } }),
  ])
  if (!roadmap) notFound()

  const allLessons = roadmap.modules.flatMap((module) => module.lessons)
  const isFullStack = roadmap.slug === "full-stack-developer"
  const countedLessons = isFullStack ? allLessons.filter((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata)) : allLessons
  const completedIds = new Set(countedLessons.filter((lesson) => lesson.progress[0]?.status === "COMPLETED").map((lesson) => lesson.id))
  const percent = countedLessons.length ? Math.round(completedIds.size / countedLessons.length * 100) : 0
  const modules = roadmap.modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, description: lesson.description, xpReward: lesson.xpReward, type: lesson.type, state: completedIds.has(lesson.id) ? "COMPLETED" as const : lesson.prerequisites.every((dependency) => completedIds.has(dependency.prerequisiteId)) ? "AVAILABLE" as const : "LOCKED" as const })) }))
  const graphProgress = countedLessons.flatMap((lesson) => {
    const metadata = readFullStackNodeMetadata(lesson.sourceMetadata)
    return metadata ? [{ key: metadata.nodeKey, lessonId: lesson.id, completed: completedIds.has(lesson.id) }] : []
  })
  const attempt = roadmap.assessmentAttempts[0]
  const initialResult = attempt ? { correctAnswers: attempt.correctAnswers, total: 50 as const, percentage: attempt.percentage, passed: attempt.passed, certificateEligible: attempt.certificateEligible } : null

  return <main className="roadmaps-pixel-ui min-h-screen bg-[#faf9f0] px-4 pb-32 pt-6 text-[#111820] sm:px-7 lg:px-10"><CharacterSelection /><div className="mx-auto max-w-330"><RoadmapTopBar backHref="/roadmaps" backLabel="Todos os roadmaps" />
    <div className="mt-5 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><div className="min-w-0 space-y-5">
      <header className="relative isolate min-h-56 overflow-hidden rounded-2xl bg-[#09252b] p-7 text-white shadow-sm sm:p-9"><Image src={isFullStack ? "/quadro12.png" : "/loginBanner.png"} alt="" fill priority sizes="(min-width:1280px) 900px,100vw" className="-z-20 object-cover object-center opacity-80" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071d23] via-[#071d23]/95 to-[#071d23]/10" /><div className="max-w-xl"><p className="font-pixel text-xs font-bold uppercase tracking-wider text-[#54dc67]">{roadmap.category}</p><h1 className="font-pixel mt-2 text-3xl font-bold leading-none tracking-tight sm:text-5xl">{roadmap.title}</h1><p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">{roadmap.description}</p><div className="mt-6 flex flex-wrap items-center gap-6 text-sm"><span className="font-pixel flex items-center gap-2"><Clock3 className="size-4" /> {roadmap.estimatedHours} horas</span><span className="font-pixel flex items-center gap-2"><Star className="size-4 text-amber-300" /> {completedIds.size}/{countedLessons.length} etapas</span></div></div><div className="mt-5 flex items-center gap-4"><div className="h-3 flex-1 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-[#50d05c] to-[#84e88d] transition-all" style={{ width: `${percent}%` }} /></div><strong className="font-pixel text-2xl text-[#67e875]">{percent}%</strong></div></header>
      {isFullStack ? <FullStackRoadmap roadmapId={roadmap.id} progress={graphProgress} initialResult={initialResult} userName={session.user.name} /> : <RoadmapJourney roadmapId={roadmap.id} modules={modules} userName={session.user.name} />}
    </div><RoadmapStatsPanel user={session.user} gamification={gamification} activeRoadmaps={activeRoadmaps} mission={missions["2"]} recommendations={recommendations} /></div>
  </div></main>
}
