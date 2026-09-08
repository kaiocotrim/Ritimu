"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { ArrowRight, BookOpen, Check, Clock3, Dumbbell, GraduationCap, LoaderCircle, Monitor, Target } from "lucide-react"
import { CodeWork } from "@/components/animations/codeWork/page"

type Lesson = { id: string; title: string; subjectName: string; time: string; durationMinutes: number; completed: boolean; type: "STUDY" | "CLASS" | "EXAM" | "ASSIGNMENT" | "PERSONAL" | "OTHER" }
const lessonStyles = {
  STUDY: { icon: Monitor, tone: "bg-emerald-50 text-emerald-700", border: "border-emerald-400/60", tag: "Foco" },
  CLASS: { icon: GraduationCap, tone: "bg-sky-50 text-sky-700", border: "border-sky-300/60", tag: "Aula" },
  EXAM: { icon: Target, tone: "bg-amber-50 text-amber-700", border: "border-amber-300/60", tag: "Avaliação" },
  ASSIGNMENT: { icon: BookOpen, tone: "bg-violet-50 text-violet-700", border: "border-violet-300/60", tag: "Atividade" },
  PERSONAL: { icon: Dumbbell, tone: "bg-violet-50 text-violet-700", border: "border-violet-300/60", tag: "Pessoal" },
  OTHER: { icon: BookOpen, tone: "bg-slate-50 text-slate-700", border: "border-black/10", tag: "Rotina" },
} as const

export function TodayLessonsList({ lessons, occurrenceDate, streak }: { lessons: Lesson[]; occurrenceDate: string; streak: number }) {
  const router = useRouter()
  const [items, setItems] = useState(lessons)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const completed = items.filter((item) => item.completed).length
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0
  const nextLessonId = items.find((item) => !item.completed)?.id
  const availableXp = items.length * 25

  async function toggleLesson(id: string) {
    const lesson = items.find((item) => item.id === id)
    if (!lesson || pendingId) return
    const nextCompleted = !lesson.completed
    setPendingId(id)
    setItems((current) => current.map((item) => item.id === id ? { ...item, completed: nextCompleted } : item))
    const response = await fetch(`/api/study-plan/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: nextCompleted, occurrenceDate }) }).catch(() => null)
    if (!response?.ok) setItems((current) => current.map((item) => item.id === id ? { ...item, completed: lesson.completed } : item))
    else router.refresh()
    setPendingId(null)
  }

  return <>
    <section className="relative mb-10 overflow-hidden rounded-[28px] bg-[#090A0C] px-6 py-7 text-white shadow-xl shadow-black/10 sm:px-8">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_70%_20%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_55%_75%,white_0_1px,transparent_1.5px)] [background-size:90px_90px,130px_130px,160px_160px]" />
      <div className="relative z-10 max-w-[72%] sm:max-w-[68%]">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Progresso de hoje</p>
        <div className="mt-2 flex items-end justify-between gap-4"><p className="text-2xl font-bold sm:text-3xl">{completed} de {items.length} concluídas</p><span className="text-2xl font-bold text-[#77ED82]">{progress}%</span></div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#50D05C] transition-[width] duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
          <span className="flex items-center gap-2"><Image src="/iconesPixel/star.png" alt="star" width={20} height={20} className="size-5" /><strong className="text-white">{availableXp} XP</strong> disponíveis</span><span className="hidden h-6 w-px bg-white/25 sm:block" /><span className="flex items-center gap-2"><Image src="/iconesPixel/fire.png" alt="fire" width={20} height={20} className="size-5" />Sequência: <strong className="text-white">{streak} dias</strong></span>
        </div>
      </div>
      <div className="absolute -bottom-5 right-1 z-10 size-36 sm:right-8 sm:size-44"><CodeWork className="size-full" /></div>
      <div className="absolute right-4 top-5 hidden max-w-36 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-white/75 sm:block">Pequenas ações.<br />Grandes resultados.</div>
    </section>

    <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-bold sm:text-2xl">Suas atividades de hoje</h2><span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs text-black/50">Ordenado por horário</span></div>
    {items.length === 0 ? <div className="rounded-3xl border border-dashed border-black/10 bg-white px-6 py-14 text-center"><p className="text-lg font-semibold">Nenhuma lição planejada para hoje</p><p className="mt-1 text-sm text-black/45">Adicione sessões no seu plano de estudos para acompanhá-las aqui.</p></div> :
      <div className="space-y-4">{items.map((lesson) => {
        const style = lessonStyles[lesson.type]; const Icon = style.icon; const isNext = lesson.id === nextLessonId
        return <article key={lesson.id} className={`flex flex-col gap-5 rounded-3xl border bg-white p-5 shadow-sm transition sm:flex-row sm:items-center sm:p-6 ${isNext ? style.border : "border-black/[0.06]"} ${lesson.completed ? "opacity-65" : ""}`}>
          <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${style.tone}`}><Icon className="size-7" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">{isNext && <span className="mb-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">Próxima atividade</span>}<h3 className={`text-xl font-bold ${lesson.completed ? "line-through" : ""}`}>{lesson.title}</h3><p className="mt-1 text-black/50">{lesson.subjectName}</p><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/50"><span className="flex items-center gap-1.5"><Clock3 className="size-4" />{lesson.time}</span>{lesson.durationMinutes > 0 && <span>{lesson.durationMinutes} min</span>}<span>{style.tag}</span></div></div>
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end"><span className={`self-end rounded-full px-4 py-2 text-sm font-bold ${style.tone}`}>+25 XP</span><button type="button" disabled={pendingId !== null} onClick={() => void toggleLesson(lesson.id)} className={`inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold transition disabled:opacity-50 ${lesson.completed ? "border border-black/15 bg-white text-black" : "bg-black text-white hover:bg-black/80"}`}>{pendingId === lesson.id ? <LoaderCircle className="size-5 animate-spin" /> : lesson.completed ? <Check className="size-5" /> : null}{lesson.completed ? "Concluída" : isNext ? "Concluir agora" : "Marcar como concluída"}{!lesson.completed && <ArrowRight className="size-5" />}</button></div>
        </article>
      })}</div>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="flex items-center gap-4 rounded-3xl border border-black/[0.06] bg-white p-5"><span className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><Image src="/iconesPixel/trophy.png" alt="trophy" width={28} height={28} className="size-7" /></span><div><p className="font-bold">Meta de hoje</p><p className="text-sm text-black/50">Conclua todas as atividades e ganhe</p><p className="font-bold text-amber-600">{availableXp} XP</p></div></div><div className="flex items-center gap-4 rounded-3xl border border-black/[0.06] bg-white p-5"><span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Target className="size-7" /></span><div><p className="font-bold">Lembre-se</p><p className="text-sm leading-relaxed text-black/50">Consistência é o que te leva longe.<br />Você consegue! 🚀</p></div></div></div>
    <blockquote className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#EDF2E7] to-[#F3F4EB] px-8 py-7 text-black/65"><p className="max-w-xl text-lg italic">“A disciplina é a ponte entre os seus objetivos e a sua realidade.”</p><footer className="mt-2 text-sm">Jim Rohn</footer><div className="absolute -bottom-12 right-10 size-32 rotate-45 bg-emerald-900/[0.04]" /></blockquote>
  </>
}
