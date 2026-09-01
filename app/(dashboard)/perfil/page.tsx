import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Mail,
  Medal,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { LogoutButton } from "@/components/auth/logout-button"
import { AnimatedCard, AnimatedItem } from "@/components/dashboard/animated-card"
import { Sidebar } from "@/components/sidebar/sidebar"
import { StudyPlanThemePreference } from "@/components/profile/study-plan-theme-preference"
import { MissionsBackgroundPreference } from "@/components/profile/missions-background-preference"
import { AccountSettings } from "@/components/profile/account-settings"
import { DashboardPreferences } from "@/components/profile/dashboard-preferences"
import { auth } from "@/lib/auth"
import { getGamificationSummary } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"

const profileStats = [
  { label: "XP total", Icon: Sparkles },
  { label: "Sequência", Icon: Flame },
  { label: "Posição", Icon: Medal },
]

export default async function PerfilPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const [coursesCount, completedItems, user, gamification, xpByUser, studyPreference] = await Promise.all([
    prisma.classroomCourse.count({ where: { userId: session.user.id } }),
    prisma.classroomItemCompletion.count({
      where: { userId: session.user.id, completed: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    }),
    getGamificationSummary(session.user.id),
    prisma.user.findMany({
      select: {
        id: true,
        xpTransactions: { select: { amount: true } },
      },
    }),
    prisma.studyPreference.findUnique({ where: { userId: session.user.id }, select: { plannerTheme: true, missionsBackgroundMode: true, missionsBackgroundUrl: true, notificationsEnabled: true, dashboardShowStreak: true, dashboardShowAgenda: true } }),
  ])

  const orderedUsers = xpByUser
    .map((item) => ({ id: item.id, xp: item.xpTransactions.reduce((sum, transaction) => sum + transaction.amount, 0) }))
    .sort((a, b) => b.xp - a.xp)
  const position = Math.max(1, orderedUsers.findIndex((item) => item.id === session.user.id) + 1)
  const liveProfileStats = profileStats.map((stat, index) => ({
    ...stat,
    value: [
      gamification.totalXp.toLocaleString("pt-BR"),
      `${gamification.streak} dias`,
      `${position}º lugar`,
    ][index],
  }))

  const initials = session.user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const memberSince = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(user?.createdAt ?? new Date())

  return (
    <main className="theme-page min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Perfil</h1>
          <p className="mt-1 text-black/50">Acompanhe sua jornada e gerencie sua conta.</p>
        </header>

        <AnimatedCard
          delay={0.05}
          className="relative mb-6 overflow-hidden rounded-3xl bg-black p-6 text-white sm:p-8"
        >
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-[#50D05C]/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-[#50D05C] text-2xl font-bold text-black sm:size-24 sm:text-3xl">
                {initials || "U"}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold sm:text-3xl">{session.user.name}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/55">
                  <Mail className="size-4" aria-hidden="true" />
                  <span className="truncate">{session.user.email}</span>
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs text-white/40">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Membro desde {memberSince}
                </p>
              </div>
            </div>

          </div>
        </AnimatedCard>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {liveProfileStats.map(({ label, value, Icon }, index) => (
            <AnimatedItem
              key={label}
              delay={0.12 + index * 0.06}
              className="flex items-center gap-4 rounded-3xl border border-black/5 bg-white p-5 shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#50D05C]/15 text-[#45B950]">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-black/45">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard
            delay={0.32}
            className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold">Seu progresso</h2>
            <p className="mt-1 text-sm text-black/45">Resumo das suas atividades na plataforma.</p>

            <div className="mt-6 space-y-3">
              <Link
                href="/disciplinas"
                className="flex items-center gap-4 rounded-2xl bg-black/[0.03] p-4 transition hover:bg-black/[0.06]"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                  <BookOpen className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Matérias conectadas</p>
                  <p className="text-sm text-black/45">{coursesCount} matérias no Google Classroom</p>
                </div>
                <ChevronRight className="size-5 text-black/25" aria-hidden="true" />
              </Link>

              <div className="flex items-center gap-4 rounded-2xl bg-black/[0.03] p-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#50D05C]/15 text-[#45B950]">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">Atividades concluídas</p>
                  <p className="text-sm text-black/45">{completedItems} conclusões registradas</p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard
            delay={0.39}
            className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold">Preferências e segurança</h2>
            <p className="mt-1 text-sm text-black/45">Configure sua experiência no Ritimu.</p>

            <div className="mt-6 divide-y divide-black/5">
              <AccountSettings initialName={session.user.name} initialNotifications={studyPreference?.notificationsEnabled ?? true} />
              <div className="flex items-center gap-4 py-4">
                <ShieldCheck className="size-5 text-black/45" aria-hidden="true" />
                <span className="flex-1 font-medium">Conta protegida</span>
                <span className="text-sm text-black/40">Verificada</span>
              </div>
              <StudyPlanThemePreference initialTheme={studyPreference?.plannerTheme === "LIGHT" ? "LIGHT" : "SPACE"} />
              <DashboardPreferences initialStreak={studyPreference?.dashboardShowStreak ?? true} initialAgenda={studyPreference?.dashboardShowAgenda ?? true} />
              <MissionsBackgroundPreference
                initialMode={studyPreference?.missionsBackgroundMode === "IMAGE" ? "IMAGE" : "DEFAULT"}
                initialUrl={studyPreference?.missionsBackgroundUrl ?? ""}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <LogoutButton />
            </div>
          </AnimatedCard>
        </div>
      </div>

      <Sidebar />
    </main>
  )
}
