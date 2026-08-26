"use client"
import { Grafico } from "@/components/animations/Grafico/page"
import { BusinessmanBalancing } from "@/components/animations/BusinessmanBalancing/page"
import { SmoothMoonwalk } from "@/components/animations/Smooth-Moonwalk/page"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { GoodVibesIcon } from "@/components/animations/GoodVibes/page"
import {IndustryWorkingIcon } from "@/components/animations/IndustryWorking/page"
import { LoaderCatIcon } from "@/components/animations/LoaderCat/page"
import {
  Brain,
  CalendarClock,
  Check,
  Clock3,
  LoaderCircle,
  Play,
  RefreshCw,
  Settings2,
  Sparkles,
  X,
} from "lucide-react"
import { motion } from "motion/react"
import { Sidebar } from "@/components/sidebar/sidebar"

type Session = {
  id: string
  title: string
  subjectName: string | null
  priorityReason: string | null
  scheduledStart: string
  scheduledEnd: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "MISSED" | "RESCHEDULED"
}

type Plan = {
  totalMinutes: number
  sessions: Session[]
}

type Subject = {
  id: string
  name: string
  difficulty: number
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function StudyPlanPage() {
  const router = useRouter()

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [config, setConfig] = useState({
    defaultSessionMinutes: 40,
    breakMinutes: 10,
    maxDailyMinutes: 120,
    availabilities: [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      startTime: "19:00",
      endTime: "21:00",
    })),
  })

  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/study-plan/today")
    const data = await response.json().catch(() => null)
    if (response.ok) {
      setPlan(data.plan)
    } else {
      setError(data?.error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => void load(), 0)
    return () => clearTimeout(id)
  }, [load])

  const completed = plan?.sessions.filter((item) => item.status === "COMPLETED").length ?? 0
  const progress = plan?.sessions.length ? Math.round((completed / plan.sessions.length) * 100) : 0
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())

  function openSettings() {
    router.push("/plano-de-estudos/configuracoes")
  }

  async function saveSettings() {
    setBusy(true)
    const response = await fetch("/api/study-plan/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...config,
        subjects: subjects.map((item) => ({ courseId: item.id, difficulty: item.difficulty })),
      }),
    })
    const data = await response.json().catch(() => null)
    setBusy(false)
    if (!response.ok) return setError(data?.error)
    setSettingsOpen(false)
  }

  async function generate(reorganize = false) {
    setBusy(true)
    setError(null)
    const response = await fetch(
      reorganize ? "/api/study-plan/reorganize" : "/api/study-plan/generate",
      { method: "POST" }
    )
    const data = await response.json().catch(() => null)
    setBusy(false)
    if (!response.ok) {
      setError(data?.error)
      if (data?.code === "PREFERENCES_REQUIRED") void openSettings()
      return
    }
    await load()
  }

  async function updateStatus(id: string, status: Session["status"]) {
    await fetch(`/api/study-plan/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  async function reschedule(id: string) {
    const value = window.prompt("Nova data e hora (AAAA-MM-DDTHH:MM):")
    if (!value) return
    const response = await fetch(`/api/study-plan/sessions/${id}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledStart: new Date(value).toISOString() }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setError(data?.error)
    } else {
      await load()
    }
  }

  const next = useMemo(
    () => plan?.sessions.find((item) => item.status === "PENDING" || item.status === "RESCHEDULED"),
    [plan]
  )

  return (
    <main className="min-h-screen bg-[#f6f5f1] px-5 pb-32 pt-8 text-[#171717] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-5"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#45b950]">
              <Sparkles className="size-4" />
              Plano inteligente
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Meu plano</h1>
            <p className="mt-2 capitalize text-black/45">{dateLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openSettings}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold"
            >
              <Settings2 className="size-4" />
              Disponibilidade
            </button>
            <button
              disabled={busy}
              onClick={() => generate(Boolean(plan))}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : plan ? (
                <RefreshCw className="size-4" />
              ) : (
                <Brain className="size-4" />
              )}
              {plan ? "Reorganizar rotina" : "Gerar meu plano"}
            </button>
          </div>
        </motion.header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <Summary
            label="Tempo planejado"
            value={`${plan?.totalMinutes ?? 0} min`}
            icon={<SmoothMoonwalk />}
            imageSrc="/palco.png"
          />
          <Summary
            label="Sessões"
            value={`${completed}/${plan?.sessions.length ?? 0}`}
            icon={<LoaderCatIcon className="h-16 w-16" />}
            imageSrc="/planetaDesenho.png"
            imageIconClassName="h-16 w-16 -translate-x-1/2 -translate-y-1/2"
            imageIconStyle={{ left: "calc(50% - 19px)", top: "calc(50% + 6px)" }}
            darkImage
          />
          <Summary
            label="Progresso do dia"
            value={`${progress}%`}
            icon={<GoodVibesIcon />}
            imageSrc="/Parque.png"
            imageIconClassName="bottom-0 left-1/2 h-16 w-16 -translate-x-1/2"
            noImageOverlay
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-semibold">Sessões de hoje</h2>
            {loading ? (
              <div className="grid min-h-64 place-items-center">
                <LoaderCircle className="animate-spin text-[#50d05c]" />
              </div>
            ) : plan?.sessions.length ? (
              <div className="space-y-4">
                {plan.sessions.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-4 ${
                      item.status === "COMPLETED"
                        ? "border-emerald-100 bg-emerald-50/60"
                        : "border-black/[.07]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-4">
                        <div className="w-24 shrink-0 text-sm font-semibold">
                          {new Date(item.scheduledStart).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          –
                          {new Date(item.scheduledEnd).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#45b950]">
                            {item.subjectName}
                          </p>
                          <h3 className="mt-1 font-semibold">{item.title}</h3>
                          <p className="mt-1 text-sm text-black/45">Motivo: {item.priorityReason}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {item.status !== "COMPLETED" && (
                        <>
                          <button
                            onClick={() => updateStatus(item.id, "IN_PROGRESS")}
                            className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold"
                          >
                            <Play className="size-3" />
                            Iniciar estudo
                          </button>
                          <button
                            onClick={() => updateStatus(item.id, "COMPLETED")}
                            className="rounded-full bg-[#50d05c] px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => updateStatus(item.id, "MISSED")}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                          >
                            Não consegui estudar
                          </button>
                          <button
                            onClick={() => reschedule(item.id)}
                            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                          >
                            Reagendar
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed text-center text-black/45">
                <div>
                  <Brain className="mx-auto mb-3 size-7" />
                  <p className="font-semibold text-black">Seu plano ainda não foi gerado</p>
                  <button
                    onClick={() => generate()}
                    className="mt-3 text-sm font-semibold text-[#45b950]"
                  >
                    Gerar meu plano
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-[28px] bg-[#171717] p-6 text-white">
            <p className="text-sm text-white/45">Próxima sessão</p>
            {next ? (
              <div className="mt-5">
                <p className="text-3xl font-semibold">
                  {new Date(next.scheduledStart).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="mt-5 text-sm font-semibold text-[#6be075]">{next.subjectName}</p>
                <h3 className="mt-1 text-xl font-semibold">{next.title}</h3>
                <p className="mt-3 text-sm text-white/45">{next.priorityReason}</p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-white/45">Nenhuma sessão pendente.</p>
            )}
          </aside>
        </section>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-[28px] bg-white p-7">
            <div className="mb-6 flex justify-between">
              <div>
                <p className="text-sm font-semibold text-[#45b950]">CONFIGURAÇÃO</p>
                <h2 className="text-2xl font-semibold">Minha disponibilidade</h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="grid size-9 place-items-center rounded-full bg-black/5 hover:bg-red-500 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField
                label="Sessão (min)"
                value={config.defaultSessionMinutes}
                onChange={(value) => setConfig({ ...config, defaultSessionMinutes: value })}
              />
              <NumberField
                label="Pausa (min)"
                value={config.breakMinutes}
                onChange={(value) => setConfig({ ...config, breakMinutes: value })}
              />
              <NumberField
                label="Máximo/dia"
                value={config.maxDailyMinutes}
                onChange={(value) => setConfig({ ...config, maxDailyMinutes: value })}
              />
            </div>

            <h3 className="mb-3 mt-6 font-semibold">Horários</h3>
            <div className="space-y-2">
              {config.availabilities.map((item, index) => (
                <div
                  key={item.weekday}
                  className="grid grid-cols-[1fr_100px_100px] items-center gap-2"
                >
                  <span className="text-sm">{dayNames[item.weekday]}</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => {
                      const copy = [...config.availabilities]
                      copy[index] = { ...item, startTime: e.target.value }
                      setConfig({ ...config, availabilities: copy })
                    }}
                    className="rounded-xl border p-2"
                  />
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => {
                      const copy = [...config.availabilities]
                      copy[index] = { ...item, endTime: e.target.value }
                      setConfig({ ...config, availabilities: copy })
                    }}
                    className="rounded-xl border p-2"
                  />
                </div>
              ))}
            </div>

            {subjects.length > 0 && (
              <>
                <h3 className="mb-3 mt-6 font-semibold">Dificuldade das matérias</h3>
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <label key={subject.id} className="flex items-center justify-between text-sm">
                      <span>{subject.name}</span>
                      <select
                        value={subject.difficulty}
                        onChange={(e) => {
                          const copy = [...subjects]
                          copy[index] = { ...subject, difficulty: Number(e.target.value) }
                          setSubjects(copy)
                        }}
                        className="rounded-xl border px-3 py-2"
                      >
                        <option value="1">Muito fácil</option>
                        <option value="2">Fácil</option>
                        <option value="3">Média</option>
                        <option value="4">Difícil</option>
                        <option value="5">Muito difícil</option>
                      </select>
                    </label>
                  ))}
                </div>
              </>
            )}

            <button
              disabled={busy}
              onClick={saveSettings}
              className="mt-7 w-full rounded-2xl bg-[#50d05c] py-3 font-semibold text-white"
            >
              Salvar configuração
            </button>
          </div>
        </div>
      )}

      <Sidebar />
    </main>
  )
}

function Summary({
  label,
  value,
  icon,
  imageSrc,
  imageIconClassName,
  imageIconStyle,
  inlineIcon = false,
  noImageOverlay = false,
  darkImage = false,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  imageSrc?: string
  imageIconClassName?: string
  imageIconStyle?: React.CSSProperties
  inlineIcon?: boolean
  noImageOverlay?: boolean
  darkImage?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/[.06] bg-white p-5">
      {imageSrc && <Image src={imageSrc} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover object-center" />}
      {imageSrc && !noImageOverlay && (
        <div
          className={`absolute inset-0 ${
            darkImage
              ? "bg-gradient-to-r from-black/55 via-black/15 to-transparent"
              : "bg-gradient-to-r from-white via-white/90 to-white/10"
          }`}
        />
      )}
      {imageSrc && icon && !inlineIcon && (
        <div
          style={imageIconStyle}
          className={`absolute z-20 text-[#50d05c] ${imageIconClassName ?? "-bottom-1 right-6 h-24 w-24"}`}
        >
          {icon}
        </div>
      )}
      <div className="relative z-10">
        {imageSrc && icon && !inlineIcon && <div aria-hidden className="mb-4 size-5" />}
        {(!imageSrc || inlineIcon) && icon && <div className="mb-4 size-5 text-[#50d05c]">{icon}</div>}
        <p className={`text-sm ${darkImage ? "text-white/75" : "text-black/45"}`}>{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${darkImage ? "text-white" : ""}`}>{value}</p>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full rounded-xl border p-3 font-normal"
      />
    </label>
  )
}
