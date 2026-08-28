"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Clock3, LoaderCircle } from "lucide-react"

type Lesson = {
  id: string
  title: string
  subjectName: string
  time: string
  durationMinutes: number
  completed: boolean
}

export function TodayLessonsList({ lessons, occurrenceDate }: { lessons: Lesson[]; occurrenceDate: string }) {
  const router = useRouter()
  const [items, setItems] = useState(lessons)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const completed = items.filter((item) => item.completed).length
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

  async function toggleLesson(id: string) {
    const lesson = items.find((item) => item.id === id)
    if (!lesson || pendingId) return

    const nextCompleted = !lesson.completed
    setPendingId(id)
    setItems((current) => current.map((item) => item.id === id ? { ...item, completed: nextCompleted } : item))

    const response = await fetch(`/api/study-plan/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: nextCompleted, occurrenceDate }),
    })

    if (!response.ok) {
      setItems((current) => current.map((item) => item.id === id ? { ...item, completed: lesson.completed } : item))
    } else {
      router.refresh()
    }
    setPendingId(null)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
        <p className="text-lg font-semibold">Nenhuma lição planejada para hoje</p>
        <p className="mt-1 text-sm text-black/45">Adicione sessões no seu plano de estudos para acompanhá-las aqui.</p>
      </div>
    )
  }

  return (
    <>
      <section className="mb-6 rounded-3xl bg-black px-6 py-6 text-white sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/50">Progresso de hoje</p>
            <p className="mt-1 text-2xl font-bold">{completed} de {items.length} concluídas</p>
          </div>
          <span className="text-2xl font-bold text-[#50D05C]">{progress}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#50D05C] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <div className="space-y-3">
        {items.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            disabled={pendingId !== null}
            onClick={() => toggleLesson(lesson.id)}
            className={`flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition sm:p-6 ${lesson.completed ? "border-[#50D05C]/30 bg-[#50D05C]/10" : "border-black/5 bg-white hover:border-black/10"}`}
          >
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition ${lesson.completed ? "bg-[#50D05C] text-black" : "bg-black/5 text-black/25"}`}>
              {pendingId === lesson.id ? <LoaderCircle className="size-5 animate-spin" /> : <Check className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block truncate font-semibold ${lesson.completed ? "text-black/45 line-through" : ""}`}>{lesson.title}</span>
              <span className="mt-1 block truncate text-sm text-black/45">{lesson.subjectName}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm text-black/45">
              <Clock3 className="size-4" aria-hidden="true" />
              {lesson.time}{lesson.durationMinutes > 0 ? ` · ${lesson.durationMinutes} min` : ""}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
