// import { headers } from "next/headers"
// import { redirect } from "next/navigation"
// import { LogoutButton } from "@/components/auth/logout-button"
// import { ConnectGoogleClassroom } from "@/components/integrations/connect-google-classroom"
// import Link from "next/link"
// import { auth } from "@/lib/auth"

// export default async function Dashboard() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   })

//   if (!session) {
//     redirect("/login")
//   }

//   return (
//     <main>
//       <h1>Dashboard</h1>

//       <p>Olá, {session.user.name}</p>
//       <ConnectGoogleClassroom />
//       <LogoutButton />
//       <Link href="/disciplinas">Minhas matérias</Link>
//     </main>
//   )
// }

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Bell, User, BookOpen, Flame, ChevronRight } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { ConnectGoogleClassroom } from "@/components/integrations/connect-google-classroom"
import { auth } from "@/lib/auth"

// TODO: substituir por dados reais (banco de dados / API) quando existirem.
// Deixei tudo tipado e isolado aqui em cima pra ficar fácil de trocar por fetch depois.

type AgendaItem = {
  id: string
  time: string
  title: string
  subtitle: string
  accent: "purple" | "blue"
}

const mockData = {
  focusProgress: 76, // 0-100
  nextTask: {
    title: "Estruturas de Dados",
    subtitle: "Algoritmos",
    progress: 60, // 0-100
  },
  streak: {
    days: 12,
    week: [
      { label: "S", done: true },
      { label: "T", done: true },
      { label: "Q", done: true },
      { label: "Q", done: true },
      { label: "S", done: true },
      { label: "S", done: true },
      { label: "D", done: false },
    ],
  },
  agenda: [
    {
      id: "1",
      time: "16:00",
      title: "Cálculo I",
      subtitle: "Aula online",
      accent: "purple",
    },
    {
      id: "2",
      time: "19:00",
      title: "Revisão - Física",
      subtitle: "Capítulos 4 e 5",
      accent: "blue",
    },
  ] as AgendaItem[],
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const firstName = session.user.name?.split(" ")[0] ?? session.user.name
  const greeting = getGreeting()

  const radius = 88
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - mockData.focusProgress / 100)

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">R</span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/disciplinas"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white sm:block"
            >
              Minhas matérias
            </Link>
            <button
              type="button"
              aria-label="Notificações"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10"
            >
              <Bell className="h-5 w-5 text-white/80" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-lime-400" />
            </button>
            <button
              type="button"
              aria-label="Perfil"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10"
            >
              <User className="h-5 w-5 text-white/80" />
            </button>
            <LogoutButton />
          </div>
        </header>

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="mt-1 text-white/50">Foco hoje, conquista sempre.</p>
        </div>

        {/* Integrations banner */}
        <div className="mb-8">
          <ConnectGoogleClassroom />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Progresso de hoje */}
          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-6 sm:p-7">
            <h2 className="mb-6 text-lg font-semibold">Progresso de hoje</h2>
            <div className="flex items-center justify-center gap-4 sm:justify-start">
              <div className="relative h-52 w-52 shrink-0">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="14"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">
                    {mockData.focusProgress}%
                  </span>
                  <span className="mt-1 text-sm text-white/50">
                    Foco do dia
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Próxima tarefa */}
          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-6 sm:p-7">
            <h2 className="mb-6 text-lg font-semibold">Próxima tarefa</h2>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-400">
                <BookOpen className="h-7 w-7 text-black" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  {mockData.nextTask.title}
                </p>
                <p className="text-white/50">{mockData.nextTask.subtitle}</p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-lime-400"
                  style={{ width: `${mockData.nextTask.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white/70">
                {mockData.nextTask.progress}%
              </span>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 py-4 text-base font-semibold text-black transition hover:bg-lime-300"
            >
              Continuar
              <ChevronRight className="h-5 w-5" />
            </button>
          </section>

          {/* Sequência */}
          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sequência</h2>
              <span className="flex items-center gap-1.5 text-sm font-medium text-white/80">
                <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
                {mockData.streak.days} dias
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {mockData.streak.week.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-white/40">{day.label}</span>
                  <div
                    className={
                      day.done
                        ? "flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-black"
                        : "flex h-10 w-10 items-center justify-center rounded-full border border-white/20"
                    }
                  >
                    {day.done && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4"
                      >
                        <path
                          d="M4 10.5L8 14.5L16 6.5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Agenda de hoje */}
          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-6 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Agenda de hoje</h2>
              <Link
                href="/agenda"
                className="flex items-center gap-1 text-sm font-medium text-lime-400 hover:text-lime-300"
              >
                Ver tudo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {mockData.agenda.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div
                    className={
                      item.accent === "purple"
                        ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-lg font-semibold italic"
                        : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500"
                    }
                  >
                    {item.accent === "purple" ? "∫x" : "⚛"}
                  </div>
                  <span className="w-14 shrink-0 text-sm text-white/50">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-white/50">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}