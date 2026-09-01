import { headers } from "next/headers"
import Image from "next/image"
import { SuccessConfettiIcon } from "@/components/animations/success-confetti/page"
import { CompletionConfetti } from "@/components/dashboard/completion-confetti"
import { AnimatedCard } from "@/components/dashboard/animated-card"
import { InteractiveProgress } from "@/components/dashboard/interactive-progress"
import { GalacticParticles } from "@/components/dashboard/galactic-particles"
import { Sidebar } from "@/components/sidebar/sidebar"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  ChevronRight,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { getGamificationSummary } from "@/lib/gamification"
import { getTodayCalendarEvents } from "@/lib/study-plan/today"
import { prisma } from "@/lib/prisma"


const weekDays = [
  { label: "S", activityIndex: 1 },
  { label: "T", activityIndex: 2 },
  { label: "Q", activityIndex: 3 },
  { label: "Q", activityIndex: 4 },
  { label: "S", activityIndex: 5 },
  { label: "S", activityIndex: 6 },
  { label: "D", activityIndex: 0 },
]

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const [gamification, todayEvents, dashboardPreference] = await Promise.all([
    getGamificationSummary(session.user.id),
    getTodayCalendarEvents(session.user.id),
    prisma.studyPreference.findUnique({ where: { userId: session.user.id }, select: { dashboardShowStreak: true, dashboardShowAgenda: true } }),
  ])
  const completedToday = todayEvents.filter((event) => event.occurrenceCompleted).length
  const todayProgress = {
    percent: todayEvents.length > 0 ? Math.round((completedToday / todayEvents.length) * 100) : 0,
  }
  const nextTask = todayEvents.find((event) => !event.occurrenceCompleted)
  const nextTaskProgress = nextTask ? 0 : todayEvents.length > 0 ? 100 : 0
  const eventTypeLabels = {
    STUDY: "Estudo",
    CLASS: "Aula",
    EXAM: "Prova",
    ASSIGNMENT: "Atividade",
    PERSONAL: "Pessoal",
    OTHER: "Outro",
  } as const
  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  })
  const agenda = todayEvents.slice(0, 2).map((event, index) => ({
    id: event.id,
    time: timeFormatter.format(event.startAt),
    title: event.title,
    subtitle: event.studySession?.subjectName ?? eventTypeLabels[event.type],
    accent: index % 2 === 0 ? "purple" as const : "blue" as const,
  }))
  const week = weekDays.map(({ label, activityIndex }) => ({
    label,
    done: gamification.weekActivity[activityIndex],
  }))


  return (
    <main className="flex min-h-screen items-center bg-[#F6F5F1] px-6 pb-32 pt-8 text-[#111111] sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* Integrations banner */}


        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Progresso de hoje */}
          <Link href="/progresso-hoje" className="block">
            <AnimatedCard
              delay={0.05}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
            >
              <Image
                src="/BannerDashboard100.png"
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-black/45 opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100" />
              <h2 className="relative z-10 mb-6 text-lg font-semibold transition-colors duration-700 group-hover:text-white">Progresso de hoje</h2>
              <div className="relative z-10 flex items-center justify-start">
                <div className="relative h-52 w-52 shrink-0">
                  <div className="absolute inset-2 rounded-full bg-white/30 backdrop-blur-md" />
                  <InteractiveProgress progress={todayProgress.percent} />
                </div>
              </div>
            </AnimatedCard>
          </Link>

          {/* Próxima tarefa */}
          <AnimatedCard
            delay={0.12}
            className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
          >
            <Image
              src="/BannerDashboard66.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="scale-[1.02] object-cover transition-[filter,transform] duration-1000 ease-in-out group-hover:scale-[1.04] group-hover:blur-[4px]"
            />
            <h2 className="relative z-10 mb-6 text-lg font-semibold text-white">Próxima tarefa</h2>
            <div className="relative z-10 mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#50D05C]">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {nextTask?.title ?? (todayEvents.length > 0 ? "Tudo concluído!" : "Nenhuma tarefa para hoje")}
                </p>
                <p className="text-white/70">{nextTask?.studySession?.subjectName ?? (nextTask ? eventTypeLabels[nextTask.type] : "Aproveite seu tempo livre")}</p>
              </div>
            </div>

            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-[#50D05C]"
                  style={{ width: `${nextTaskProgress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white/80">
                {nextTaskProgress}%
              </span>
            </div>

            <Link href="/progresso-hoje" className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#50D05C] py-4 text-base font-semibold text-white transition hover:bg-[#45B950]">
                Continuar
                <ChevronRight className="h-5 w-5" />
            </Link>
          </AnimatedCard>

          {/* Sequência */}
          {(dashboardPreference?.dashboardShowStreak ?? true) && <AnimatedCard
            delay={0.19}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-4 sm:p-7"
          >
            <Image
              src="/BannerDashboard4.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#080B1B]/80 opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100" />
            <GalacticParticles />
            <CompletionConfetti />
            <div className="relative z-10 flex items-center justify-between">
              <h2 className="text-lg font-semibold transition-colors duration-700 group-hover:text-white">Sequência</h2>
              <span className="flex items-center gap-1.5 text-sm font-medium text-black/70 transition-colors duration-700 group-hover:text-white/80">
                <Image src="/fire_1f525.png" width={16} height={16} alt="" />
                {gamification.streak} dias
              </span>
            </div>
            <div className="relative z-10 grid flex-1 grid-cols-7 items-center gap-2 py-6 text-center">
              {week.map((day, index) => (
                <div
                  key={`${day.label}-${index}`}
                  className="flex min-w-0 flex-col items-center gap-3"
                >
                  <span className="text-xs text-black/40 transition-colors duration-700 group-hover:text-white/60">
                    {day.label}
                  </span>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-visible">
                    {day.done ? (
                      <SuccessConfettiIcon className="h-12 w-12 scale-[2.2]" />
                    ) : (
                      <div className="h-12 w-12 rounded-full border border-black/15 bg-white transition-colors duration-700 group-hover:border-white/30 group-hover:bg-white/10" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>}

          {/* Agenda de hoje */}
          {(dashboardPreference?.dashboardShowAgenda ?? true) && <AnimatedCard
            delay={0.26}
            className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#11152F] via-[#25205A] to-[#351B5E] opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100" />
            <GalacticParticles />
            <div className="absolute right-6 top-1/2 size-[152px] -translate-y-1/2 transition-[filter,transform] duration-1000 group-hover:brightness-110 group-hover:saturate-125">
              <Image
                src="/BannerDashboard8.png"
                alt=""
                fill
                sizes="152px"
                className="object-contain"
              />
            </div>
            <div className="relative z-10 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold transition-colors duration-700 group-hover:text-white">Agenda de hoje</h2>
              <Link
                href="/agenda"
                className="flex items-center gap-1 text-sm font-medium text-[#50D05C] hover:text-[#45B950]"
              >
                Ver tudo
                <ChevronRight className="h-4 w-4" />

              </Link>
            </div>
            <div className="relative z-10 w-[72%] divide-y divide-black/5 transition-colors duration-700 group-hover:divide-white/10">
              {agenda.length === 0 && (
                <p className="py-8 text-sm text-black/45 transition-colors duration-700 group-hover:text-white/60">
                  Nenhum compromisso agendado para hoje.
                </p>
              )}
              {agenda.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div
                    className={
                      item.accent === "purple"
                        ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-lg font-semibold italic text-white"
                        : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white"
                    }
                  >
                    {item.accent === "purple" ? "∫x" : "⚛"}
                  </div>
                  <span className="w-14 shrink-0 text-sm text-black/50 transition-colors duration-700 group-hover:text-white/60">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-semibold transition-colors duration-700 group-hover:text-white">{item.title}</p>
                    <p className="text-sm text-black/50 transition-colors duration-700 group-hover:text-white/60">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>}
        </div>
      </div>

      <Sidebar />
    </main>
  )
} 
