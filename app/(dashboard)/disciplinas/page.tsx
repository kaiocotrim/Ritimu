import { FireIcon } from "@/components/animations/fire/page"

import { RocketLaunchIcon } from "@/components/animations/rocket/page"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Sigma,
  Target,
} from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SyncGoogleClassroom } from "@/components/integrations/sync-google-classroom"
import { CreateManualCourse } from "@/components/classroom/create-manual-course"
import { AnimatedCard, AnimatedItem } from "@/components/dashboard/animated-card"
import { Sidebar } from "@/components/sidebar/sidebar"

// Paleta cíclica de ícone + cor por card, na ordem do mockup.
const CARD_STYLES = [
  { Icon: Sigma, className: "bg-emerald-400" },
  { Icon: Code2, className: "bg-violet-500" },
  { Icon: Brain, className: "bg-amber-400" },
  { Icon: Database, className: "bg-pink-500" },
  { Icon: BookOpen, className: "bg-sky-500" },
]

type Filter = "todas" | "andamento" | "concluidas"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "andamento", label: "Em andamento" },
  { id: "concluidas", label: "Concluídas" },
]

// TODO: substituir por dados reais de sequência (streak) / meta diária / XP
// total assim que existir uma tabela/serviço para isso. Isolado aqui em cima,
// no mesmo padrão do dashboard, pra trocar por fetch depois.
const heroMock = {
  streakDays: 12,
  dailyGoalPercent: 75,
  xpTotal: 1250,
  xpNextLevel: 1500,
}

export default async function DisciplinasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const { filter: filterParam } = await searchParams
  const activeFilter: Filter =
    filterParam === "andamento" || filterParam === "concluidas"
      ? filterParam
      : "todas"

  const courses = await prisma.classroomCourse.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          itemCompletions: {
            where: { completed: true },
          },
        },
      },
    },
  })

  const courseCards = courses.map((course) => {
    const completedCount = course._count.itemCompletions
    const totalItems = course.totalItems
    const progressPercent =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
    const isCompleted = totalItems > 0 && completedCount === totalItems

    // TODO: substituir por XP/nível reais assim que existir gamificação no
    // schema. Derivado do progresso real só pra não deixar o card vazio —
    // não afeta a lógica de conclusão.
    const xp = completedCount * 25
    const level = Math.max(1, Math.floor(xp / 100) + 1)

    return {
      id: course.id,
      name: course.name,
      section: course.section,
      progressPercent,
      isCompleted,
      xp,
      level,
    }
  })

  const filteredCourses = courseCards.filter((course) => {
    if (activeFilter === "concluidas") return course.isCompleted
    if (activeFilter === "andamento") return !course.isCompleted
    return true
  })

  const xpProgress = Math.min(
    100,
    Math.round((heroMock.xpTotal / heroMock.xpNextLevel) * 100)
  )

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Minhas matérias
            </h1>
            <p className="mt-1 text-[#111111]/50">
              Continue sua jornada. Cada aula te aproxima do seu objetivo! 🚀
            </p>
          </div>
          <SyncGoogleClassroom
            initiallySynced={courses.some(
              (course) => course.courseState !== "MANUAL" && !course.googleCourseId.startsWith("manual:")
            )}
          />
        </div>

        {/* Hero banner */}
        <AnimatedCard
          delay={0.05}
          className="relative mb-8 overflow-hidden rounded-3xl bg-black px-6 py-7 text-white sm:px-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <FireIcon
                className="size-25 shrink-0 fill-orange-500 text-orange-500"
              />
              <div>
                <p className="text-sm text-white/50">Sequência atual</p>
                <p className="text-2xl font-bold">
                  {heroMock.streakDays}{" "}
                  <span className="text-base font-medium text-white/60">
                    dias
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Você está mandando bem!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target
                className="size-9 shrink-0 text-sky-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm text-white/50">Meta diária</p>
                <p className="text-2xl font-bold">
                  {heroMock.dailyGoalPercent}%{" "}
                  <span className="text-base font-medium text-white/60">
                    concluída
                  </span>

                </p>
                <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-400"
                    style={{ width: `${heroMock.dailyGoalPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-center rounded-full bg-white/5 p-5 sm:flex">
              <RocketLaunchIcon className="size-8 text-lime-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-lime-400 text-xs font-bold text-lime-400">
                XP
              </div>
              <div>
                <p className="text-sm text-white/50">XP total</p>
                <p className="text-2xl font-bold">
                  {heroMock.xpTotal.toLocaleString("pt-BR")}{" "}
                  <span className="text-base font-medium text-white/60">
                    pontos
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Próximo nível: {heroMock.xpNextLevel.toLocaleString("pt-BR")}{" "}
                  XP
                </p>
                <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-400"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Filters + sort */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <Link
                key={item.id}
                href={
                  item.id === "todas" ? "/disciplinas" : `/disciplinas?filter=${item.id}`
                }
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeFilter === item.id
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black/60 hover:border-black/20 hover:text-black"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 hover:border-black/20"
          >
            Mais recentes
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Grid */}
        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-10 text-center text-sm text-black/50">
            Nenhuma matéria conectada ainda. Sincronize o Google Classroom para
            começar.
            <div><CreateManualCourse compact /></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => {
              const style = CARD_STYLES[index % CARD_STYLES.length]
              const Icon = style.Icon

              return (
                <AnimatedItem
                  key={course.id}
                  delay={0.12 + index * 0.06}
                  className="h-full"
                >
                <Link
                  href={`/disciplinas/${course.id}`}
                  className="group block h-full rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-white ${style.className}`}
                    >
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    {course.isCompleted && (
                      <CheckCircle2
                        className="size-5 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-semibold leading-snug">
                    {course.name}
                  </h2>
                  {course.section && (
                    <p className="mt-0.5 text-sm text-black/45">
                      {course.section}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-lime-400"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-black/60">
                      {course.progressPercent}%
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span
                      className="flex items-center gap-1.5 text-black/60"
                      title="XP acumulado nesta matéria"
                    >
                      🎖 {course.xp}
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-black/60"
                      title="Nível estimado a partir do seu progresso"
                    >
                     <img src="trophy_1f3c6.png" alt="" width="13" height="13" />  Nível {course.level}
                    </span>
                  </div>
                </Link>
                </AnimatedItem>
              )
            })}

            <AnimatedItem delay={0.12 + filteredCourses.length * 0.06} className="h-full"><CreateManualCourse /></AnimatedItem>
          </div>
        )}
      </div>

      <Sidebar />
    </main>
  )
}
