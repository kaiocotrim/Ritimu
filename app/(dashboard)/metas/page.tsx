import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { AnimatedCard, AnimatedItem } from "@/components/dashboard/animated-card"
import { Sidebar } from "@/components/sidebar/sidebar"

// TODO: substituir por dados reais (banco de dados / API) quando existirem.
// Estrutura isolada aqui em cima pra ficar fácil trocar por fetch depois,
// no mesmo padrão usado em /dashboard e /disciplinas.

type Mission = {
  id: string
  title: string
  description: string
  type: "diaria" | "semanal"
  progress: number // 0-100
  current: number
  target: number
  xp: number
  completed: boolean
}

const missionsMock: Mission[] = [
  {
    id: "1",
    title: "Complete 1 atividade",
    description: "Termine qualquer atividade de uma matéria hoje.",
    type: "diaria",
    progress: 100,
    current: 1,
    target: 1,
    xp: 20,
    completed: true,
  },
  {
    id: "2",
    title: "Estude por 30 minutos",
    description: "Fique pelo menos 30 minutos ativo em uma matéria.",
    type: "diaria",
    progress: 60,
    current: 18,
    target: 30,
    xp: 15,
    completed: false,
  },
  {
    id: "3",
    title: "Mantenha a sequência",
    description: "Acesse a plataforma hoje sem quebrar sua sequência.",
    type: "diaria",
    progress: 100,
    current: 1,
    target: 1,
    xp: 10,
    completed: true,
  },
  {
    id: "4",
    title: "Finalize 5 atividades",
    description: "Complete 5 atividades em qualquer matéria nesta semana.",
    type: "semanal",
    progress: 40,
    current: 2,
    target: 5,
    xp: 80,
    completed: false,
  },
  {
    id: "5",
    title: "Explore 3 matérias diferentes",
    description: "Avance o progresso em pelo menos 3 matérias distintas.",
    type: "semanal",
    progress: 66,
    current: 2,
    target: 3,
    xp: 60,
    completed: false,
  },
  {
    id: "6",
    title: "Sequência de 7 dias",
    description: "Mantenha 7 dias seguidos de atividade na plataforma.",
    type: "semanal",
    progress: 100,
    current: 7,
    target: 7,
    xp: 100,
    completed: true,
  },
]

type Filter = "todas" | "diarias" | "semanais"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "diarias", label: "Diárias" },
  { id: "semanais", label: "Semanais" },
]

export default async function MissoesPage({
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
    filterParam === "diarias" || filterParam === "semanais"
      ? filterParam
      : "todas"

  const filteredMissions = missionsMock.filter((mission) => {
    if (activeFilter === "diarias") return mission.type === "diaria"
    if (activeFilter === "semanais") return mission.type === "semanal"
    return true
  })

  const completedCount = missionsMock.filter((m) => m.completed).length
  const totalXpAvailable = missionsMock.reduce((sum, m) => sum + m.xp, 0)
  const xpEarned = missionsMock
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + m.xp, 0)

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Missões
          </h1>
          <p className="mt-1 text-black/50">
            Cumpra desafios, ganhe XP e mantenha o ritmo. 🎯
          </p>
        </div>

        {/* Hero banner */}
        <AnimatedCard
          delay={0.05}
          className="mb-8 overflow-hidden rounded-3xl bg-black px-6 py-7 text-white sm:px-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <CheckCircle2
                className="size-9 shrink-0 text-lime-400"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm text-white/50">Missões concluídas</p>
                <p className="text-2xl font-bold">
                  {completedCount}{" "}
                  <span className="text-base font-medium text-white/60">
                    de {missionsMock.length}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Zap className="size-9 shrink-0 text-amber-400" aria-hidden="true" />
              <div>
                <p className="text-sm text-white/50">XP ganho hoje</p>
                <p className="text-2xl font-bold">
                  {xpEarned}{" "}
                  <span className="text-base font-medium text-white/60">
                    / {totalXpAvailable} XP
                  </span>
                </p>
                <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-lime-400"
                    style={{
                      width: `${Math.round((xpEarned / totalXpAvailable) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="hidden items-center justify-center rounded-full bg-white/5 p-5 sm:flex">
              <Trophy className="size-8 text-lime-400" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-3">
              <Flame
                className="size-9 shrink-0 fill-orange-500 text-orange-500"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm text-white/50">Sequência</p>
                <p className="text-2xl font-bold">
                  12{" "}
                  <span className="text-base font-medium text-white/60">
                    dias
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  Complete missões pra manter viva!
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Link
              key={item.id}
              href={item.id === "todas" ? "/metas" : `/metas?filter=${item.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === item.id
                  ? "bg-black text-white"
                  : "border border-black/10 bg-white text-black/60 hover:border-black/20 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Missions list */}
        <div className="space-y-4">
          {filteredMissions.map((mission, index) => (
            <AnimatedItem
              key={mission.id}
              delay={0.12 + index * 0.06}
              className={`flex flex-col gap-4 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
                mission.completed
                  ? "border-lime-200 bg-lime-50/60"
                  : "border-black/5 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                    mission.completed
                      ? "bg-lime-400 text-black"
                      : "bg-black/5 text-black/60"
                  }`}
                >
                  {mission.completed ? (
                    <CheckCircle2 className="size-5" aria-hidden="true" />
                  ) : mission.type === "diaria" ? (
                    <Target className="size-5" aria-hidden="true" />
                  ) : (
                    <Calendar className="size-5" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold leading-tight">
                      {mission.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                        mission.type === "diaria"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-violet-100 text-violet-700"
                      }`}
                    >
                      {mission.type === "diaria" ? "Diária" : "Semanal"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-black/50">
                    {mission.description}
                  </p>

                  {!mission.completed && (
                    <div className="mt-3 flex items-center gap-3 sm:hidden">
                      <div className="h-2 w-40 overflow-hidden rounded-full bg-black/10">
                        <div
                          className="h-full rounded-full bg-lime-400"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-black/50">
                        {mission.current}/{mission.target}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-5 sm:pl-4">
                {!mission.completed && (
                  <div className="hidden items-center gap-3 sm:flex">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-lime-400"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-black/50">
                      {mission.current}/{mission.target}
                    </span>
                  </div>
                )}

                <span
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    mission.completed
                      ? "bg-lime-400 text-black"
                      : "bg-black/5 text-black/60"
                  }`}
                >
                  <Sparkles className="size-4" aria-hidden="true" />+{mission.xp}
                  {" "}XP
                </span>

                {mission.completed ? (
                  <CheckCircle2
                    className="size-6 shrink-0 text-lime-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    className="size-6 shrink-0 text-black/15"
                    aria-hidden="true"
                  />
                )}
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>

      <Sidebar />
    </main>
  )
}
