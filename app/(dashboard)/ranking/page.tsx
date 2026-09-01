import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Medal, Sparkles, TrendingUp, Trophy } from "lucide-react"

import { AnimatedCard } from "@/components/dashboard/animated-card"
import { PodiumCard } from "@/components/ranking/podium-card"
import { Sidebar } from "@/components/sidebar/sidebar"
import { auth } from "@/lib/auth"
import { calculateStreak } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"

type RankingStudent = {
  id: string
  name: string
  email: string
  xp: number
  streak: number
  initials: string
  color: string
  x1Matches: number
  x1Wins: number
}

const avatarColors = ["bg-violet-500", "bg-sky-500", "bg-amber-500", "bg-[#50D05C]", "bg-pink-500", "bg-orange-500", "bg-cyan-500"]

function getInitials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "U"
}

export default async function RankingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/login")

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      xpTransactions: {
        select: { amount: true, earnedAt: true },
      },
      _count: { select: { x1MatchesAsX: true, x1MatchesAsO: true, x1MatchesWon: true } },
    },
  })

  const ranking: RankingStudent[] = users
    .map((user, index) => {
      return {
        id: user.id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        xp: user.xpTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
        streak: calculateStreak(user.xpTransactions.map((transaction) => transaction.earnedAt)),
        initials: getInitials(user.name || user.email),
        color: avatarColors[index % avatarColors.length],
        x1Matches: user._count.x1MatchesAsX + user._count.x1MatchesAsO,
        x1Wins: user._count.x1MatchesWon,
      }
    })
    .sort((a, b) => b.xp - a.xp || b.streak - a.streak || a.name.localeCompare(b.name, "pt-BR"))

  const currentPosition = ranking.findIndex((student) => student.id === session.user.id)
  const currentStudent = ranking[currentPosition]
  const studentAhead = currentPosition > 0 ? ranking[currentPosition - 1] : null
  const xpToAdvance = studentAhead && currentStudent ? Math.max(studentAhead.xp - currentStudent.xp + 25, 25) : 0
  const podiumOrder = [ranking[1], ranking[0], ranking[2]].filter(
    (student): student is RankingStudent => Boolean(student),
  )

  return (
    <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ranking</h1>
          <p className="mt-1 text-black/50">Continue estudando para subir de posição.</p>
        </header>

        <AnimatedCard delay={0.05} className="relative mb-6 overflow-hidden rounded-3xl bg-black p-6 text-white sm:p-8">
          <div className="absolute -right-12 -top-20 size-64 rounded-full bg-[#50D05C]/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
                <TrendingUp className="size-4 text-[#50D05C]" aria-hidden="true" />
                Sua evolução
              </span>
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                {currentPosition === 0 ? "Você está no topo!" : `Você está em ${currentPosition + 1}º lugar`}
              </h2>
              <p className="mt-1 max-w-lg text-sm text-white/55">
                {currentPosition === 0
                  ? `${currentStudent?.name ?? session.user.name}, continue estudando para manter a liderança.`
                  : `Faltam ${xpToAdvance.toLocaleString("pt-BR")} XP para alcançar a próxima posição.`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#50D05C] text-2xl font-bold text-black">
                {currentPosition + 1}º
              </div>
              <div>
                <p className="text-sm text-white/50">Seu total</p>
                <p className="text-2xl font-bold">{(currentStudent?.xp ?? 0).toLocaleString("pt-BR")} XP</p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {podiumOrder.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {podiumOrder.map((student) => {
              const position = ranking.findIndex((item) => item.id === student.id) + 1

              return (
                <PodiumCard
                  key={student.id}
                  name={student.name}
                  xp={student.xp}
                  initials={student.initials}
                  color={student.color}
                  position={position}
                  delay={0.12 + (3 - position) * 0.04}
                />
              )
            })}
          </div>
        )}

        <AnimatedCard delay={0.34} className="overflow-hidden rounded-3xl border border-black/5 bg-white">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold">Classificação geral</h2>
              <p className="text-sm text-black/45">Todos os usuários e o XP registrado na plataforma</p>
            </div>
            <Trophy className="size-6 text-[#50D05C]" aria-hidden="true" />
          </div>

          <div className="divide-y divide-black/5">
            {ranking.map((student, index) => {
              const isCurrentUser = student.id === session.user.id

              return (
                <div key={student.id} className={`flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 ${isCurrentUser ? "bg-[#50D05C]/10" : ""}`}>
                  <div className="flex w-8 shrink-0 items-center justify-center font-bold text-black/45">
                    {index < 3 ? (
                      <Medal
                        className={`size-5 ${index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : "text-orange-600"}`}
                        aria-label={`${index + 1}º lugar`}
                      />
                    ) : index + 1}
                  </div>

                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${student.color}`}>
                    {student.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{student.name}{isCurrentUser ? " (você)" : ""}</p>
                    <p className="truncate text-xs text-black/45">{student.email}</p>
                    <p className="text-xs text-black/45">🔥 {student.streak} dias de sequência</p>
                    <p className="text-xs text-black/45">X1: {student.x1Wins} vitórias em {student.x1Matches} partidas</p>
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
