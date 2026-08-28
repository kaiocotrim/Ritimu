import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { TodayLessonsList } from "@/components/dashboard/today-lessons-list"
import { Sidebar } from "@/components/sidebar/sidebar"
import { auth } from "@/lib/auth"
import { getDateKey, getTodayCalendarEvents } from "@/lib/study-plan/today"

export default async function TodayProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const events = await getTodayCalendarEvents(session.user.id)
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  })

  const eventTypeLabels = {
    STUDY: "Estudo",
    CLASS: "Aula",
    EXAM: "Prova",
    ASSIGNMENT: "Atividade",
    PERSONAL: "Pessoal",
    OTHER: "Outro",
  } as const
  const lessons = events
    .map((event) => ({
      id: event.id,
      title: event.title,
      subjectName: event.studySession?.subjectName ?? eventTypeLabels[event.type],
      time: timeFormatter.format(event.startAt),
      durationMinutes: event.endAt
        ? Math.max(0, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60_000))
        : 0,
      completed: event.occurrenceCompleted,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-black/45 transition hover:text-black">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>
        <header className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lições de hoje</h1>
          <p className="mt-1 text-black/50">Marque o que você concluiu e acompanhe seu progresso.</p>
        </header>

        <TodayLessonsList lessons={lessons} occurrenceDate={getDateKey()} />
      </div>
      <Sidebar />
    </main>
  )
}
