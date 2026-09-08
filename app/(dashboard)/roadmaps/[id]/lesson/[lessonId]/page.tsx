import { headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, BookOpen, Clock3, ExternalLink, Gift, ListChecks } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getFreeResources } from "@/lib/roadmaps/free-resources"
import { LessonCompletion } from "@/components/roadmaps/lesson-completion"
import { Sidebar } from "@/components/sidebar/sidebar"

export default async function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { id, lessonId } = await params
  const lesson = await prisma.roadmapLesson.findFirst({ where: { id: lessonId, module: { roadmapId: id, roadmap: { OR: [{ isPublic: true }, { creatorId: session.user.id }] } } }, include: { module: { include: { roadmap: { select: { title: true } } } }, prerequisites: { include: { prerequisite: { select: { id: true, title: true, progress: { where: { userId: session.user.id }, select: { status: true } } } } } }, progress: { where: { userId: session.user.id }, select: { status: true } } } })
  if (!lesson) notFound()
  const content = Array.isArray(lesson.content) ? lesson.content.filter((item): item is string => typeof item === "string") : []
  const resources = getFreeResources(lesson.module.title, lesson.title)
  const completed = lesson.progress[0]?.status === "COMPLETED"
  const locked = lesson.prerequisites.some(({ prerequisite }) => prerequisite.progress[0]?.status !== "COMPLETED")
  return <main className="min-h-screen bg-[#F6F5F1] px-5 pb-32 pt-8 text-[#111] sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><Link href={`/roadmaps/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black"><ArrowLeft className="size-4" /> Voltar ao mapa</Link>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]"><article className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#299d37]">{lesson.module.roadmap.title} · {lesson.module.title}</p><h1 className="mt-3 text-3xl font-bold sm:text-5xl">{lesson.title}</h1><p className="mt-4 text-lg leading-8 text-black/60">{lesson.description}</p>
      <div className="mt-7 flex flex-wrap gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-sm"><Clock3 className="size-4" /> {lesson.estimatedMinutes} minutos</span><span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-2 text-sm font-bold text-amber-700"><Gift className="size-4" /> {lesson.xpReward} XP</span></div>
      <section className="mt-10"><h2 className="flex items-center gap-2 text-xl font-bold"><ListChecks className="size-5 text-[#299d37]" /> Objetivo da etapa</h2><p className="mt-3 rounded-2xl bg-[#effbef] p-5 leading-7 text-black/65">{lesson.objective ?? `Compreender e aplicar ${lesson.title}.`}</p></section>
      <section className="mt-10"><h2 className="flex items-center gap-2 text-xl font-bold"><BookOpen className="size-5 text-[#299d37]" /> Conteúdo</h2><div className="mt-4 space-y-3">{content.map((paragraph, index) => <div key={index} className="flex gap-3 rounded-2xl border border-black/5 p-4 leading-7 text-black/65"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-black text-xs font-bold text-white">{index + 1}</span><p>{paragraph}</p></div>)}</div></section>
      {lesson.prerequisites.length > 0 && <section className="mt-10"><h2 className="text-lg font-bold">Pré-requisitos</h2><div className="mt-3 flex flex-wrap gap-2">{lesson.prerequisites.map(({ prerequisite }) => <span key={prerequisite.id} className="rounded-full border border-black/10 px-3 py-1.5 text-sm">{prerequisite.title} {prerequisite.progress[0]?.status === "COMPLETED" ? "✓" : "🔒"}</span>)}</div></section>}
    </article>
    <aside className="h-fit rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm lg:sticky lg:top-6"><div className="rounded-2xl border border-[#50D05C]/30 bg-[#effbef] p-4"><h2 className="font-bold text-[#247f2d]">Recursos gratuitos</h2><p className="mt-1 text-sm leading-6 text-black/55">Materiais externos selecionados para estudar este assunto.</p></div><div className="mt-4 space-y-3">{resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="group block rounded-2xl border border-black/10 p-4 transition hover:border-[#50D05C] hover:bg-[#f7fff7]"><div className="flex items-start justify-between gap-3"><div><span className="rounded bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase text-violet-700">{resource.kind}</span><h3 className="mt-2 font-semibold group-hover:text-[#299d37]">{resource.title}</h3><p className="mt-1 text-xs text-black/45">{resource.provider} · Gratuito</p></div><ExternalLink className="size-4 shrink-0 text-black/30" /></div></a>)}</div><div className="mt-5"><LessonCompletion roadmapId={id} lessonId={lesson.id} completed={completed} locked={locked} /></div><p className="mt-4 text-center text-[11px] leading-5 text-black/35">Conteúdo introdutório do Ritimu. Os materiais externos pertencem aos respectivos autores.</p></aside>
    </div></div><Sidebar /></main>
}
