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
  Flame,
} from "lucide-react"
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

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }


  return (
    <main className="flex min-h-screen items-center bg-[#F6F5F1] px-6 pb-32 pt-8 text-[#111111] sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* Integrations banner */}


        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Progresso de hoje */}
          <AnimatedCard
            delay={0.05}
            className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 sm:p-7"
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
                <InteractiveProgress progress={mockData.focusProgress} />
              </div>
            </div>
          </AnimatedCard>

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
                  {mockData.nextTask.title}
                </p>
                <p className="text-white/70">{mockData.nextTask.subtitle}</p>
              </div>
            </div>

            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full rounded-full bg-[#50D05C]"
                  style={{ width: `${mockData.nextTask.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white/80">
                {mockData.nextTask.progress}%
              </span>
            </div>

            <Link href="/disciplinas" className="relative z-10 mt-3 block text-center text-sm font-medium text-[#50D05C] hover:text-[#45B950]">

              <button
                type="button"
                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl bg-[#50D05C] py-4 text-base font-semibold text-white transition hover:bg-[#45B950]"
              >
                Continuar
                <ChevronRight className="h-5 w-5" />
              </button>
            </Link>
          </AnimatedCard>

          {/* Sequência */}
          <AnimatedCard
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
                <img src="fire_1f525.png" width="16" height="16" alt="" />
                {mockData.streak.days} dias
              </span>
            </div>
            <div className="relative z-10 grid flex-1 grid-cols-7 items-center gap-2 py-6 text-center">
              {mockData.streak.week.map((day, index) => (
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
          </AnimatedCard>

          {/* Agenda de hoje */}
          <AnimatedCard
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
              {mockData.agenda.map((item) => (
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
          </AnimatedCard>
        </div>
      </div>

      <Sidebar />
    </main>
  )
} 
