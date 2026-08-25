import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Crown, Medal, Sparkles, TrendingUp, Trophy } from "lucide-react"

import { AnimatedCard, AnimatedItem } from "@/components/dashboard/animated-card"
import { Sidebar } from "@/components/sidebar/sidebar"
import { auth } from "@/lib/auth"

type RankingStudent = {
  name: string
  xp: number
  streak: number
  initials: string
  color: string
}

const rankingMock: RankingStudent[] = [
  { name: "Marina Souza", xp: 2480, streak: 18, initials: "MS", color: "bg-violet-500" },
  { name: "Lucas Almeida", xp: 2315, streak: 15, initials: "LA", color: "bg-sky-500" },
  { name: "Beatriz Lima", xp: 2190, streak: 14, initials: "BL", color: "bg-amber-400" },
  { name: "Você", xp: 1870, streak: 12, initials: "VC", color: "bg-[#50D05C]" },
  { name: "Rafael Costa", xp: 1695, streak: 10, initials: "RC", color: "bg-pink-500" },
  { name: "Ana Clara", xp: 1540, streak: 9, initials: "AC", color: "bg-orange-400" },
  { name: "João Pedro", xp: 1380, streak: 7, initials: "JP", color: "bg-cyan-500" },
]

const podiumOrder = [rankingMock[1], rankingMock[0], rankingMock[2]]

export default async function RankingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const currentName = session.user.name || session.user.email

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ranking</h1>
          <p className="mt-1 text-black/50">
            Continue estudando para subir de posição.
          </p>
        </header>

        <AnimatedCard
          delay={0.05}
          className="relative mb-6 overflow-hidden rounded-3xl bg-black p-6 text-white sm:p-8"
        >
          <div className="absolute -right-12 -top-20 size-64 rounded-full bg-[#50D05C]/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
                <TrendingUp className="size-4 text-[#50D05C]" aria-hidden="true" />
                Sua evolução
              </span>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Você está no top 5!</h2>
              <p className="mt-1 max-w-lg text-sm text-white/55">
                {currentName}, faltam 320 XP para alcançar a terceira posição.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#50D05C] text-2xl font-bold text-black">
                4º
              </div>
              <div>
                <p className="text-sm text-white/50">Seu total</p>
                <p className="text-2xl font-bold">1.870 XP</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {podiumOrder.map((student, index) => {
            const position = index === 0 ? 2 : index === 1 ? 1 : 3
            const isChampion = position === 1

            return (
              <AnimatedItem
                key={student.name}
                delay={0.12 + index * 0.07}
                className={`relative flex flex-col items-center rounded-3xl border bg-white p-6 text-center shadow-sm ${
                  isChampion ? "border-[#50D05C]/40 sm:-translate-y-2" : "border-black/5"
                }`}
              >
                {isChampion && (
                  <Crown className="mb-2 size-7 fill-amber-400 text-amber-500" aria-hidden="true" />
                )}
                <div className={`flex size-16 items-center justify-center rounded-full text-lg font-bold text-white ${student.color}`}>
                  {student.initials}
                </div>
                <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-black/35">
                  {position}º lugar
                </span>
                <h2 className="mt-1 font-semibold">{student.name}</h2>
                <p className="mt-1 text-sm font-bold text-[#45B950]">
                  {student.xp.toLocaleString("pt-BR")} XP
                </p>
              </AnimatedItem>
            )
          })}
        </div>

        <AnimatedCard
          delay={0.34}
          className="overflow-hidden rounded-3xl border border-black/5 bg-white"
        >
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Classificação geral</h2>
              <p className="text-sm text-black/45">Atualizada com o XP desta semana</p>
            </div>
            <Trophy className="size-6 text-[#50D05C]" aria-hidden="true" />
          </div>

          <div className="divide-y divide-black/5">
            {rankingMock.map((student, index) => {
              const isCurrentUser = student.name === "Você"

              return (
                <div
                  key={student.name}
                  className={`flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 ${
                    isCurrentUser ? "bg-[#50D05C]/10" : ""
                  }`}
                >
                  <div className="flex w-8 shrink-0 items-center justify-center font-bold text-black/45">
                    {index < 3 ? (
                      <Medal
                        className={`size-5 ${
                          index === 0
                            ? "text-amber-500"
                            : index === 1
                              ? "text-slate-400"
                              : "text-orange-600"
                        }`}
                        aria-label={`${index + 1}º lugar`}
                      />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${student.color}`}>
                    {student.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {isCurrentUser ? currentName : student.name}
                    </p>
                    <p className="text-xs text-black/45">🔥 {student.streak} dias de sequência</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 font-semibold">
                    <Sparkles className="size-4 text-[#50D05C]" aria-hidden="true" />
                    {student.xp.toLocaleString("pt-BR")} XP
                  </div>
                </div>
              )
            })}
          </div>
        </AnimatedCard>
      </div>

      <Sidebar />
    </main>
  )
}
